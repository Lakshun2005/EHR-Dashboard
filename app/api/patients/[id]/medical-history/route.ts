import { NextResponse } from 'next/server';
import * as medicalHistoryService from '@/lib/services/medicalHistory.service';
import { z } from 'zod';

const medicalHistorySchema = z.object({
  diagnosis: z.string().min(1),
  diagnosisDate: z.string().datetime(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const medicalHistory = await medicalHistoryService.listMedicalHistoryForPatient(params.id);
    return NextResponse.json(medicalHistory);
  } catch (error) {
    console.error('[MEDICAL_HISTORY_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const body = await request.json();
    const validation = medicalHistorySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id, // Use the id from the route params
    };

    const newMedicalHistory = await medicalHistoryService.createMedicalHistory(data);
    return NextResponse.json(newMedicalHistory, { status: 201 });
  } catch (error) {
    console.error('[MEDICAL_HISTORY_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}