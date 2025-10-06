import { NextResponse } from 'next/server';
import * as allergyService from '@/lib/services/allergy.service';
import { z } from 'zod';
import { RiskLevel } from '@prisma/client';

const updateAllergySchema = z.object({
  substance: z.string().min(1).optional(),
  reaction: z.string().min(1).optional(),
  severity: z.nativeEnum(RiskLevel).optional(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; allergyId: string } } // `id` is patientId
) {
  try {
    const record = await allergyService.getAllergyById(params.allergyId);
    if (!record || record.patientId !== params.id) {
      return new NextResponse('Allergy record not found for this patient', { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error('[ALLERGY_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; allergyId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await allergyService.getAllergyById(params.allergyId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Allergy record not found for this patient', { status: 404 });
    }

    const body = await request.json();
    const validation = updateAllergySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedRecord = await allergyService.updateAllergy(params.allergyId, validation.data);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('[ALLERGY_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; allergyId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await allergyService.getAllergyById(params.allergyId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Allergy record not found for this patient', { status: 404 });
    }

    await allergyService.deleteAllergy(params.allergyId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ALLERGY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}