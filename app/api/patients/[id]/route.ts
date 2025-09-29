import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

interface Params {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        medicalHistory: true,
        vitalSigns: true,
        medications: true,
        allergies: true,
        labResults: true,
        procedures: true,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error(`Error fetching patient ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, gender, phone, email, address, status, riskLevel } = body

    const updatedPatient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email,
        address,
        status,
        riskLevel,
      },
    })

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error(`Error updating patient ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await prisma.patient.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(`Error deleting patient ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}