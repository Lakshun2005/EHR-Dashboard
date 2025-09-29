import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("searchTerm") || ""

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { medicalRecordNumber: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        medicalHistory: {
          orderBy: {
            diagnosisDate: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedPatients = patients.map((patient) => {
      const latestHistory = patient.medicalHistory[0]
      return {
        id: patient.id,
        mrn: patient.medicalRecordNumber,
        name: `${patient.firstName} ${patient.lastName}`,
        age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
        lastVisit: new Date(patient.createdAt).toISOString().split("T")[0],
        status: latestHistory?.diagnosis || "Unknown", // Using diagnosis as status for now
        riskLevel: patient.riskLevel,
      }
    })

    return NextResponse.json(transformedPatients)
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