import { NextResponse } from 'next/server';
import * as medicationService from '@/lib/services/medication.service';
import { z } from 'zod';

const updateMedicationSchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; medicationId: string } } // `id` is patientId
) {
  try {
    const record = await medicationService.getMedicationById(params.medicationId);
    if (!record || record.patientId !== params.id) {
      return new NextResponse('Medication record not found for this patient', { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error('[MEDICATION_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; medicationId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await medicationService.getMedicationById(params.medicationId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Medication record not found for this patient', { status: 404 });
    }

    const body = await request.json();
    const validation = updateMedicationSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedRecord = await medicationService.updateMedication(params.medicationId, validation.data);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('[MEDICATION_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; medicationId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await medicationService.getMedicationById(params.medicationId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Medication record not found for this patient', { status: 404 });
    }

    await medicationService.deleteMedication(params.medicationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MEDICATION_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}