import { openai } from "@ai-sdk/openai"
import { streamText, generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  const { type, data } = await req.json()

  switch (type) {
    case "clinical_assessment": {
      const { patientData, symptoms, vitals, medicalHistory, currentMedications } = data

      const prompt = `
        You are an expert clinical decision support system. Analyze the following patient data and provide a comprehensive clinical assessment.

        Patient Data:
        - Age: ${patientData.age}
        - Gender: ${patientData.gender}
        - Current Symptoms: ${symptoms.join(", ")}
        - Vital Signs: ${JSON.stringify(vitals)}
        - Relevant Medical History: ${medicalHistory.join(", ")}
        - Current Medications: ${currentMedications.join(", ")}

        Generate an assessment in the following JSON format:
        {
          "riskLevel": "low" | "medium" | "high" | "critical",
          "primaryConcerns": ["string"],
          "recommendations": [{ "category": "string", "priority": "low" | "medium" | "high", "action": "string", "rationale": "string" }],
          "differentialDiagnosis": [{ "condition": "string", "probability": "low" | "medium" | "high", "supportingFactors": ["string"], "additionalTests": ["string"] }],
          "alerts": [{ "type": "string", "severity": "low" | "medium" | "high" | "critical", "message": "string", "action": "string" }]
        }
      `
      const { object } = await generateObject({
        model: openai("gpt-4-turbo"),
        schema: z.object({
            riskLevel: z.enum(["low", "medium", "high", "critical"]),
            primaryConcerns: z.array(z.string()),
            recommendations: z.array(z.object({
                category: z.string(),
                priority: z.enum(["low", "medium", "high"]),
                action: z.string(),
                rationale: z.string(),
            })),
            differentialDiagnosis: z.array(z.object({
                condition: z.string(),
                probability: z.enum(["low", "medium", "high"]),
                supportingFactors: z.array(z.string()),
                additionalTests: z.array(z.string()).optional(),
            })),
            alerts: z.array(z.object({
                type: z.string(),
                severity: z.enum(["low", "medium", "high", "critical"]),
                message: z.string(),
                action: z.string(),
            })),
        }),
        prompt,
      })

      return Response.json({ assessment: object })
    }

    case "drug_interaction": {
      const { medications, newMedication } = data
      const prompt = `
        You are an expert pharmacologist. Check for potential drug interactions between the following medications:
        - Current Medications: ${medications.join(", ")}
        - New Medication: ${newMedication}

        Provide the result in the following JSON format:
        {
          "interactions": [{ "drug1": "string", "drug2": "string", "severity": "low" | "medium" | "high", "description": "string", "clinicalEffect": "string", "management": "string", "alternatives": ["string"] }],
          "overallRisk": "low" | "medium" | "high",
          "recommendations": ["string"]
        }
      `
      const { object } = await generateObject({
        model: openai("gpt-4-turbo"),
        schema: z.object({
            interactions: z.array(z.object({
                drug1: z.string(),
                drug2: z.string(),
                severity: z.enum(["low", "medium", "high"]),
                description: z.string(),
                clinicalEffect: z.string(),
                management: z.string(),
                alternatives: z.array(z.string()).optional(),
            })),
            overallRisk: z.enum(["low", "medium", "high"]),
            recommendations: z.array(z.string()),
        }),
        prompt,
      })

      return Response.json({ interactions: object })
    }

    case "diagnostic_assistance": {
      const { symptoms, patientHistory } = data
      const result = await streamText({
        model: openai("gpt-4-turbo"),
        prompt: `You are a diagnostic assistant. Based on the following symptoms and patient history, provide a list of differential diagnoses and suggested next steps.
        Symptoms: ${symptoms.join(", ")}
        History: ${patientHistory}`,
      })
      return result.toAIStreamResponse({
        "Content-Type": "application/json",
        "X-Experimental-Stream-Data": "true",
      })
    }

    default: {
      return Response.json({ error: "Invalid AI service type" }, { status: 400 })
    }
  }
}