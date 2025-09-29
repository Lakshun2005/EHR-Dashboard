import { google } from "@ai-sdk/google"
import { streamText, generateObject } from "ai"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const maxDuration = 300 // Increase timeout for background tasks

async function runClinicalAssessment(taskId: string, data: any) {
  try {
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
      Generate an assessment in the specified JSON format.
    `
    const { object } = await generateObject({
      model: google("gemini-pro"),
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

    await prisma.backgroundTask.update({
      where: { id: taskId },
      data: { status: "COMPLETED", output: object as any },
    })
  } catch (error) {
    await prisma.backgroundTask.update({
      where: { id: taskId },
      data: { status: "FAILED", error: (error as Error).message },
    })
  }
}

async function runDrugInteractionCheck(taskId: string, data: any) {
  try {
    const { medications, newMedication } = data
    const prompt = `
      You are an expert pharmacologist. Check for potential drug interactions.
      - Current Medications: ${medications.join(", ")}
      - New Medication: ${newMedication}
      Provide the result in the specified JSON format.
    `
    const { object } = await generateObject({
      model: google("gemini-pro"),
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

    await prisma.backgroundTask.update({
      where: { id: taskId },
      data: { status: "COMPLETED", output: object as any },
    })
  } catch (error) {
    await prisma.backgroundTask.update({
      where: { id: taskId },
      data: { status: "FAILED", error: (error as Error).message },
    })
  }
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const { type, data } = await req.json()

  // For streaming, we can't easily make it a background task.
  // This will remain synchronous for now.
  if (type === "diagnostic_assistance") {
    const { symptoms, patientHistory } = data
    const result = await streamText({
      model: google("gemini-pro"),
      prompt: `You are a diagnostic assistant...`,
    })
    return result.toAIStreamResponse()
  }

  const task = await prisma.backgroundTask.create({
    data: {
      type,
      status: "PENDING",
      input: data,
      userId: user.id,
    },
  })

  // Fire-and-forget the background job
  switch (type) {
    case "clinical_assessment":
      runClinicalAssessment(task.id, data)
      break
    case "drug_interaction":
      runDrugInteractionCheck(task.id, data)
      break
    default:
      return new Response(JSON.stringify({ error: "Invalid AI service type" }), { status: 400 })
  }

  return new Response(JSON.stringify({ taskId: task.id }), { status: 202 })
}