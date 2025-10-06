import { NextResponse } from 'next/server';
import * as medicalHistoryService from '@/lib/services/medicalHistory.service';
import { z } from 'zod';

const updateMedicalHistorySchema = z.object({
  diagnosis: z.string().min(1).optional(),
  diagnosisDate: z.string().datetime().optional(),
  treatment: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; historyId: string } } // `id` is patientId
) {
  try {
    const record = await medicalHistoryService.getMedicalHistoryById(params.historyId);
    // Ensure the record belongs to the correct patient
    if (!record || record.patientId !== params.id) {
      return new NextResponse('Medical history record not found for this patient', { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error('[MEDICAL_HISTORY_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; historyId: string } } // `id` is patientId
) {
  try {
    // Optional: First, verify the record belongs to the patient before updating
    const existingRecord = await medicalHistoryService.getMedicalHistoryById(params.historyId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Medical history record not found for this patient', { status: 404 });
    }

    const body = await request.json();
    const validation = updateMedicalHistorySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedRecord = await medicalHistoryService.updateMedicalHistory(params.historyId, validation.data);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('[MEDICAL_HISTORY_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; historyId: string } } // `id` is patientId
) {
  try {
    // Optional: First, verify the record belongs to the patient before deleting
    const existingRecord = await medicalHistoryService.getMedicalHistoryById(params.historyId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Medical history record not found for this patient', { status: 404 });
    }

    await medicalHistoryService.deleteMedicalHistory(params.historyId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MEDICAL_HISTORY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}