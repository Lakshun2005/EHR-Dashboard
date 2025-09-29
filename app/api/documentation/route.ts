import { openai } from "@ai-sdk/openai"
import { generateText, streamText } from "ai"
import { z } from "zod"

export const maxDuration = 30

// Schema for structured clinical note
const clinicalNoteSchema = z.object({
  subjective: z.string().describe("Patient-reported symptoms and history"),
  objective: z.string().describe("Observable findings and measurements"),
  assessment: z.string().describe("Clinical assessment and diagnosis"),
  plan: z.string().describe("Treatment plan and follow-up"),
  icdCodes: z.array(z.string()).describe("Relevant ICD-10 codes"),
  cptCodes: z.array(z.string()).describe("Relevant CPT codes for procedures"),
})

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json()

    switch (type) {
      case "generate_soap_note":
        return await generateSOAPNote(data)
      case "transcribe_voice":
        return await transcribeVoiceNote(data)
      case "extract_medical_info":
        return await extractMedicalInformation(data)
      case "generate_discharge_summary":
        return await generateDischargeSummary(data)
      case "create_progress_note":
        return await createProgressNote(data)
      default:
        return Response.json({ error: "Invalid request type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Documentation AI Error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateSOAPNote(data: any) {
  const { patientInfo, visitDetails, symptoms, vitals, examination, diagnosis, treatment } = data

  const prompt = `
    Generate a comprehensive SOAP note for the following patient encounter:

    Patient Information:
    - Name: ${patientInfo.name}
    - Age: ${patientInfo.age}
    - Gender: ${patientInfo.gender}
    - MRN: ${patientInfo.mrn}

    Visit Details:
    - Date: ${visitDetails.date}
    - Type: ${visitDetails.type}
    - Chief Complaint: ${visitDetails.chiefComplaint}

    Clinical Information:
    - Symptoms: ${symptoms}
    - Vital Signs: ${JSON.stringify(vitals)}
    - Physical Examination: ${examination}
    - Assessment: ${diagnosis}
    - Treatment Plan: ${treatment}

    Please format as a professional SOAP note with:
    - Subjective: Patient's reported symptoms and history
    - Objective: Vital signs, physical exam findings, and test results
    - Assessment: Clinical impression and diagnosis
    - Plan: Treatment plan, medications, follow-up instructions

    Include appropriate medical terminology and ensure clinical accuracy.
  `

  const result = streamText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 2000,
    temperature: 0.3,
  })

  return result.toTextStreamResponse()
}

async function transcribeVoiceNote(data: any) {
  const { audioTranscript, context } = data

  const prompt = `
    Convert the following voice transcription into a structured clinical note:

    Audio Transcript: "${audioTranscript}"
    
    Clinical Context: ${context}

    Please clean up the transcription, correct any medical terminology, and format it into a professional clinical note. Include:
    - Proper medical terminology
    - Structured format (SOAP if applicable)
    - Corrected grammar and punctuation
    - Relevant clinical details organized logically
  `

  const { text } = await generateText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 1500,
    temperature: 0.2,
  })

  return Response.json({ transcribedNote: text })
}

async function extractMedicalInformation(data: any) {
  const { documentText, extractionType } = data

  const prompt = `
    Extract the following medical information from this document:

    Document: "${documentText}"
    
    Extraction Type: ${extractionType}

    Please extract and structure the relevant medical information including:
    - Patient demographics
    - Medical history
    - Current medications
    - Allergies
    - Diagnoses
    - Procedures
    - Lab results
    - Vital signs

    Format the extracted information in a clear, structured manner.
  `

  const { text } = await generateText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 1200,
    temperature: 0.2,
  })

  return Response.json({ extractedInfo: text })
}

async function generateDischargeSummary(data: any) {
  const { admissionDate, dischargeDate, diagnosis, procedures, medications, followUp } = data

  const prompt = `
    Generate a comprehensive discharge summary with the following information:

    Admission Date: ${admissionDate}
    Discharge Date: ${dischargeDate}
    Primary Diagnosis: ${diagnosis}
    Procedures Performed: ${procedures}
    Discharge Medications: ${medications}
    Follow-up Instructions: ${followUp}

    Please create a professional discharge summary including:
    - Hospital course summary
    - Condition at discharge
    - Discharge medications with instructions
    - Follow-up appointments and care instructions
    - Patient education provided
    - Discharge disposition

    Use appropriate medical terminology and ensure completeness for continuity of care.
  `

  const result = streamText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 2000,
    temperature: 0.3,
  })

  return result.toTextStreamResponse()
}

async function createProgressNote(data: any) {
  const { patientInfo, interval, currentStatus, changes, plan } = data

  const prompt = `
    Create a progress note for the following patient:

    Patient: ${patientInfo.name} (${patientInfo.mrn})
    Interval: ${interval}
    Current Status: ${currentStatus}
    Changes Since Last Visit: ${changes}
    Updated Plan: ${plan}

    Generate a concise but comprehensive progress note including:
    - Current clinical status
    - Response to treatment
    - Any new symptoms or concerns
    - Updated assessment
    - Modified treatment plan
    - Next steps and follow-up

    Format professionally for medical record documentation.
  `

  const { text } = await generateText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 1000,
    temperature: 0.3,
  })

  return Response.json({ progressNote: text })
}
