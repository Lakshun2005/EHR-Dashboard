import { google } from "@ai-sdk/google"
import { streamText, generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  const { type, data } = await req.json()

  switch (type) {
    case "generate_soap_note": {
      const { patientInfo, visitDetails, symptoms, vitals, examination, diagnosis, treatment } = data
      const prompt = `
        You are a medical scribe generating a clinical SOAP note.
        Given the following information, create a comprehensive and well-structured SOAP note.

        Patient Information:
        - Name: ${patientInfo.name}
        - MRN: ${patientInfo.mrn}
        - Age: ${patientInfo.age}
        - Gender: ${patientInfo.gender}

        Visit Details:
        - Date: ${visitDetails.date}
        - Type: ${visitDetails.type}
        - Chief Complaint: ${visitDetails.chiefComplaint}

        Clinical Data:
        - Subjective (Symptoms): ${symptoms}
        - Objective (Vitals & Examination): Vitals: ${JSON.stringify(vitals)}. Physical Exam: ${examination}.
        - Assessment (Diagnosis): ${diagnosis}
        - Plan (Treatment): ${treatment}

        Generate the SOAP note now. Use markdown for formatting.
      `
      const result = await streamText({
        model: google("models/gemini-1.5-pro-latest"),
        prompt,
      })
      return result.toAIStreamResponse()
    }

    case "transcribe_voice": {
      const { audioTranscript, context } = data
      const prompt = `
        You are a medical transcriptionist. Convert the following raw audio transcript into a structured clinical note based on the provided context.
        Context: ${context}
        Transcript: "${audioTranscript}"

        Structure the output clearly. For example, if the context is a progress note, use headings like "Subjective," "Objective," etc.
      `
      const { object } = await generateObject({
        model: google("models/gemini-1.5-pro-latest"),
        schema: z.object({
          transcribedNote: z.string().describe("The structured clinical note generated from the transcript."),
        }),
        prompt,
      })
      return Response.json({ transcribedNote: object.transcribedNote })
    }

    case "extract_medical_info": {
      const { documentText, extractionType } = data
      const prompt = `
        You are a data extraction specialist. From the following document, extract the requested medical information.
        Document Text: "${documentText}"
        Information to Extract: ${extractionType}

        Format the output as a simple string summary.
      `
      const { object } = await generateObject({
        model: google("models/gemini-1.5-pro-latest"),
        schema: z.object({
          extractedInfo: z.string().describe("The extracted medical information."),
        }),
        prompt,
      })
      return Response.json({ extractedInfo: object.extractedInfo })
    }

    default: {
      return Response.json({ error: "Invalid documentation service type" }, { status: 400 })
    }
  }
}