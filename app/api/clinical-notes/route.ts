import { openai } from "@ai-sdk/openai"
import { generateText, streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json()

    switch (type) {
      case "generate_note":
        return await generateClinicalNote(data)
      case "summarize_visit":
        return await summarizeVisit(data)
      case "extract_icd_codes":
        return await extractICDCodes(data)
      default:
        return Response.json({ error: "Invalid request type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Clinical Notes AI Error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateClinicalNote(data: any) {
  const { patientInfo, visitType, chiefComplaint, assessment, plan } = data

  const prompt = `
    Generate a professional clinical note for the following patient visit:

    Patient: ${patientInfo.name} (${patientInfo.age} years old, ${patientInfo.gender})
    Visit Type: ${visitType}
    Chief Complaint: ${chiefComplaint}
    Assessment: ${assessment}
    Plan: ${plan}

    Format the note using standard medical documentation structure (SOAP format):
    - Subjective
    - Objective  
    - Assessment
    - Plan

    Use appropriate medical terminology and ensure the note is comprehensive yet concise.
  `

  const result = streamText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 2000,
    temperature: 0.4,
  })

  return result.toTextStreamResponse()
}

async function summarizeVisit(data: any) {
  const { visitNotes, duration, procedures } = data

  const prompt = `
    Summarize the following patient visit information into a concise clinical summary:

    Visit Notes: ${visitNotes}
    Duration: ${duration} minutes
    Procedures: ${procedures.join(", ")}

    Provide a brief but comprehensive summary highlighting key findings, decisions, and follow-up plans.
  `

  const { text } = await generateText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 800,
    temperature: 0.3,
  })

  return Response.json({ summary: text })
}

async function extractICDCodes(data: any) {
  const { clinicalNote, symptoms, diagnoses } = data

  const prompt = `
    Based on the following clinical information, suggest appropriate ICD-10 codes:

    Clinical Note: ${clinicalNote}
    Symptoms: ${symptoms.join(", ")}
    Diagnoses: ${diagnoses.join(", ")}

    Provide ICD-10 codes with descriptions and confidence levels. Format as:
    Code: Description (Confidence: High/Medium/Low)
  `

  const { text } = await generateText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 1000,
    temperature: 0.2,
  })

  return Response.json({ icdCodes: text })
}
