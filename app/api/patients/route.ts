import { NextResponse } from 'next/server';
import * as patientService from '@/lib/services/patient.service';
import { z } from 'zod';

// Schema for creating a patient to validate the request body
const createPatientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  // Add other fields as necessary from your Prisma schema
});


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const result = await patientService.listPatients({ page, limit, search });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PATIENTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
        return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    // Convert date string to Date object
    const patientData = {
        ...validation.data,
        dateOfBirth: new Date(validation.data.dateOfBirth),
    };

    const patient = await patientService.createPatient(patientData);
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('[PATIENTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}