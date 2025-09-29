import { openai } from "@ai-sdk/openai"
import { generateObject, generateText } from "ai"
import { z } from "zod"

export const maxDuration = 30

// Schema for clinical assessment
const clinicalAssessmentSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high", "critical"]).describe("Overall patient risk level"),
  primaryConcerns: z.array(z.string()).describe("Main clinical concerns identified"),
  recommendations: z
    .array(
      z.object({
        category: z.enum(["diagnostic", "treatment", "monitoring", "referral"]),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        action: z.string().describe("Specific recommended action"),
        rationale: z.string().describe("Clinical reasoning for this recommendation"),
      }),
    )
    .describe("Clinical recommendations"),
  differentialDiagnosis: z
    .array(
      z.object({
        condition: z.string(),
        probability: z.enum(["low", "moderate", "high"]),
        supportingFactors: z.array(z.string()),
        additionalTests: z.array(z.string()).optional(),
      }),
    )
    .describe("Possible diagnoses to consider"),
  alerts: z
    .array(
      z.object({
        type: z.enum(["drug_interaction", "allergy", "contraindication", "critical_value"]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        message: z.string(),
        action: z.string(),
      }),
    )
    .describe("Clinical alerts and warnings"),
})

// Schema for drug interaction check
const drugInteractionSchema = z.object({
  interactions: z.array(
    z.object({
      drug1: z.string(),
      drug2: z.string(),
      severity: z.enum(["minor", "moderate", "major", "contraindicated"]),
      description: z.string(),
      clinicalEffect: z.string(),
      management: z.string(),
      alternatives: z.array(z.string()).optional(),
    }),
  ),
  overallRisk: z.enum(["low", "moderate", "high", "critical"]),
  recommendations: z.array(z.string()),
})

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json()

    switch (type) {
      case "clinical_assessment":
        return await handleClinicalAssessment(data)
      case "drug_interaction":
        return await handleDrugInteraction(data)
      case "diagnostic_assistance":
        return await handleDiagnosticAssistance(data)
      default:
        return Response.json({ error: "Invalid request type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Clinical AI Error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleClinicalAssessment(data: any) {
  const { patientData, symptoms, vitals, medicalHistory, currentMedications } = data

  const prompt = `
    As a clinical decision support system, analyze the following patient information and provide a comprehensive assessment:

    Patient Information:
    - Age: ${patientData.age}
    - Gender: ${patientData.gender}
    - Medical History: ${medicalHistory.join(", ")}
    - Current Medications: ${currentMedications.join(", ")}

    Current Presentation:
    - Symptoms: ${symptoms.join(", ")}
    - Vital Signs: ${JSON.stringify(vitals)}

    Please provide a structured clinical assessment including risk stratification, recommendations, differential diagnosis, and any clinical alerts.
  `

  const { object } = await generateObject({
    model: openai("gpt-4"),
    schema: clinicalAssessmentSchema,
    prompt,
    temperature: 0.3, // Lower temperature for more consistent clinical recommendations
  })

  return Response.json({ assessment: object })
}

async function handleDrugInteraction(data: any) {
  const { medications, newMedication } = data

  const prompt = `
    Analyze potential drug interactions between the following medications:
    
    Current Medications: ${medications.join(", ")}
    New Medication: ${newMedication}

    Provide a comprehensive drug interaction analysis including severity levels, clinical effects, and management recommendations.
  `

  const { object } = await generateObject({
    model: openai("gpt-4"),
    schema: drugInteractionSchema,
    prompt,
    temperature: 0.2, // Very low temperature for drug safety
  })

  return Response.json({ interactions: object })
}

async function handleDiagnosticAssistance(data: any) {
  const { symptoms, patientHistory, labResults, imaging } = data

  const prompt = `
    Provide diagnostic assistance for a patient with the following presentation:
    
    Symptoms: ${symptoms.join(", ")}
    Patient History: ${patientHistory}
    Lab Results: ${labResults || "None available"}
    Imaging: ${imaging || "None available"}

    Suggest possible diagnoses, recommended tests, and clinical reasoning.
  `

  const { text } = await generateText({
    model: openai("gpt-4"),
    prompt,
    maxOutputTokens: 1500,
    temperature: 0.3,
  })

  return Response.json({ diagnosticSuggestions: text })
}
