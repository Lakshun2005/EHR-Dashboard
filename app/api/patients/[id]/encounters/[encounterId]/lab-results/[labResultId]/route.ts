import { NextResponse } from 'next/server';
import * as labResultService from '@/lib/services/labResult.service';
import { z } from 'zod';

const updateLabResultSchema = z.object({
  testName: z.string().min(1).optional(),
  resultValue: z.string().optional(),
  units: z.string().optional().nullable(),
  referenceRange: z.string().optional().nullable(),
  collectedAt: z.string().datetime().optional(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; encounterId: string; labResultId: string } } // `id` is patientId
) {
  try {
    const record = await labResultService.getLabResultById(params.labResultId);
    if (!record || record.patientId !== params.id || record.encounterId !== params.encounterId) {
      return new NextResponse('Lab result not found for this encounter', { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error('[LAB_RESULT_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; encounterId: string; labResultId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await labResultService.getLabResultById(params.labResultId);
    if (!existingRecord || existingRecord.patientId !== params.id || existingRecord.encounterId !== params.encounterId) {
        return new NextResponse('Lab result not found for this encounter', { status: 404 });
    }

    const body = await request.json();
    const validation = updateLabResultSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedRecord = await labResultService.updateLabResult(params.labResultId, validation.data);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('[LAB_RESULT_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; encounterId: string; labResultId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await labResultService.getLabResultById(params.labResultId);
    if (!existingRecord || existingRecord.patientId !== params.id || existingRecord.encounterId !== params.encounterId) {
        return new NextResponse('Lab result not found for this encounter', { status: 404 });
    }

    await labResultService.deleteLabResult(params.labResultId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[LAB_RESULT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}