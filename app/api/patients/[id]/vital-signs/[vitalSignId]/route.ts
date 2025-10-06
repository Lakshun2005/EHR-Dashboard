import { NextResponse } from 'next/server';
import * as vitalSignService from '@/lib/services/vitalSign.service';
import { z } from 'zod';

const updateVitalSignSchema = z.object({
  timestamp: z.string().datetime().optional(),
  heartRate: z.number().int().optional().nullable(),
  bloodPressure: z.string().optional().nullable(),
  temperature: z.number().optional().nullable(),
  respiratoryRate: z.number().int().optional().nullable(),
  oxygenSaturation: z.number().optional().nullable(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; vitalSignId: string } } // `id` is patientId
) {
  try {
    const record = await vitalSignService.getVitalSignById(params.vitalSignId);
    if (!record || record.patientId !== params.id) {
      return new NextResponse('Vital sign record not found for this patient', { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error('[VITAL_SIGN_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; vitalSignId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await vitalSignService.getVitalSignById(params.vitalSignId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Vital sign record not found for this patient', { status: 404 });
    }

    const body = await request.json();
    const validation = updateVitalSignSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedRecord = await vitalSignService.updateVitalSign(params.vitalSignId, validation.data);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('[VITAL_SIGN_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; vitalSignId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await vitalSignService.getVitalSignById(params.vitalSignId);
    if (!existingRecord || existingRecord.patientId !== params.id) {
        return new NextResponse('Vital sign record not found for this patient', { status: 404 });
    }

    await vitalSignService.deleteVitalSign(params.vitalSignId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[VITAL_SIGN_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}