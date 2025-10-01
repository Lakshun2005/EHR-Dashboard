import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { EncounterType } from "@prisma/client"

async function getKpis() {
  const totalPatients = await prisma.Patient.count()
  const occupiedBeds = await prisma.Bed.count({ where: { isOccupied: true } })
  const totalBeds = await prisma.Bed.count()
  const bedOccupancy = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0

  const encounters = await prisma.Encounter.findMany({
    where: {
      startTime: { not: null },
      endTime: { not: null },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  let avgStay = 0
  if (encounters.length > 0) {
    const totalStayDuration = encounters.reduce((acc, encounter) => {
      const duration = encounter.endTime.getTime() - encounter.startTime.getTime()
      return acc + duration
    }, 0)
    const avgDurationMs = totalStayDuration / encounters.length
    avgStay = avgDurationMs / (1000 * 60 * 60 * 24) // Convert ms to days
  }

  return {
    totalPatients,
    avgSatisfaction: 4.6, // NOTE: Not in schema, returning mock data
    bedOccupancy: Math.round(bedOccupancy),
    avgStay: parseFloat(avgStay.toFixed(1)),
  }
}

async function getPatientVolume() {
  const encounters = await prisma.Encounter.groupBy({
    by: ["type", "startTime"],
    _count: {
      id: true,
    },
    orderBy: {
      startTime: "asc",
    },
  })

  const monthlyVolume = encounters.reduce((acc, encounter) => {
    const month = new Date(encounter.startTime).toLocaleString("default", { month: "short" })
    if (!acc[month]) {
      acc[month] = { month, inpatient: 0, outpatient: 0, emergency: 0, virtual: 0, total: 0 }
    }
    const key = encounter.type.toLowerCase() as keyof typeof acc[string]
    if (key in acc[month]) {
        acc[month][key] += encounter._count.id
    }
    acc[month].total += encounter._count.id
    return acc
  }, {})

  return Object.values(monthlyVolume)
}

async function getDiagnosisDistribution() {
  const diagnosisCounts = await prisma.MedicalHistory.groupBy({
    by: ["diagnosis"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 5,
  })

  const totalDiagnoses = await prisma.MedicalHistory.count()
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"]

  const distribution = diagnosisCounts.map((item, index) => ({
    name: item.diagnosis,
    value: totalDiagnoses > 0 ? Math.round((item._count.id / totalDiagnoses) * 100) : 0,
    count: item._count.id,
    color: colors[index % colors.length],
  }))

  // Add an "Other" category if there are more than 5 diagnoses
  if (totalDiagnoses > diagnosisCounts.reduce((acc, item) => acc + item._count.id, 0)) {
    const otherCount = totalDiagnoses - diagnosisCounts.reduce((acc, item) => acc + item._count.id, 0)
    distribution.push({
        name: "Other",
        value: totalDiagnoses > 0 ? Math.round((otherCount / totalDiagnoses) * 100) : 0,
        count: otherCount,
        color: colors[5],
    })
  }

  return distribution
}

async function getDepartmentMetrics() {
    const departmentData = await prisma.Department.findMany({
        include: {
            _count: {
                select: {
                    encounters: true,
                }
            }
        }
    })

    return departmentData.map(dept => ({
        department: dept.name,
        patients: dept._count.encounters,
        satisfaction: 4.5, // NOTE: Not in schema, returning mock data
        avgStay: 3.8, // NOTE: Complex calculation, returning mock data
        revenue: 350000, // NOTE: Not in schema, returning mock data
    }))
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get("metric")

    let data;
    switch (metric) {
      case "kpis":
        data = await getKpis()
        break
      case "patientVolume":
        data = await getPatientVolume()
        break
      case "diagnosisDistribution":
        data = await getDiagnosisDistribution()
        break
      case "departmentMetrics":
        data = await getDepartmentMetrics()
        break
      default:
        return NextResponse.json({ error: "Invalid or missing metric parameter" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}