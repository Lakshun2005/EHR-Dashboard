import { NextResponse } from 'next/server';
import * as medicationService from '@/lib/services/medication.service';
import { z } from 'zod';

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string(),
  frequency: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const medications = await medicationService.listMedicationsForPatient(params.id);
    return NextResponse.json(medications);
  } catch (error) {
    console.error('[MEDICATIONS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const body = await request.json();
    const validation = medicationSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id,
    };

    const newMedication = await medicationService.createMedication(data);
    return NextResponse.json(newMedication, { status: 201 });
  } catch (error) {
    console.error('[MEDICATIONS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}