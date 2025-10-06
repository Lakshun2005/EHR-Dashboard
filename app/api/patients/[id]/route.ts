import { NextResponse } from 'next/server';
import * as patientService from '@/lib/services/patient.service';
import { z } from 'zod';

// Schema for updating a patient to validate the request body
const updatePatientSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }).optional(),
  // Add other fields as necessary from your Prisma schema
}).partial();


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await patientService.getPatientById(params.id);
    if (!patient) {
      return new NextResponse('Patient not found', { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (error) {
    console.error('[PATIENT_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
        return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    // Convert date string to Date object if it exists
    const patientData = validation.data.dateOfBirth
        ? { ...validation.data, dateOfBirth: new Date(validation.data.dateOfBirth) }
        : validation.data;

    const patient = await patientService.updatePatient(params.id, patientData);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('[PATIENT_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await patientService.deletePatient(params.id);
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('[PATIENT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}