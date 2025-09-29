import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("searchTerm") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const whereClause = {
      OR: [
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { medicalRecordNumber: { contains: searchTerm, mode: "insensitive" } },
      ],
    }

    const [patients, totalPatients] = await prisma.$transaction([
      prisma.patient.findMany({
        where: whereClause,
        select: {
          id: true,
          medicalRecordNumber: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          createdAt: true,
          riskLevel: true,
          medicalHistory: {
            select: {
              diagnosis: true,
            },
            orderBy: {
              diagnosisDate: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      }),
      prisma.patient.count({ where: whereClause }),
    ])

    const transformedPatients = patients.map(patient => {
      const latestHistory = patient.medicalHistory[0]
      return {
        id: patient.id,
        mrn: patient.medicalRecordNumber,
        name: `${patient.firstName} ${patient.lastName}`,
        age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
        lastVisit: new Date(patient.createdAt).toISOString().split("T")[0],
        status: latestHistory?.diagnosis || "Unknown",
        riskLevel: patient.riskLevel,
      }
    })

    return NextResponse.json({
      data: transformedPatients,
      total: totalPatients,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, gender } = body

    const newPatient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
      },
    })

    return NextResponse.json(newPatient, { status: 201 })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}