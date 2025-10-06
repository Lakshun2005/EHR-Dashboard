import { NextResponse } from 'next/server';
import * as procedureService from '@/lib/services/procedure.service';
import { z } from 'zod';

const updateProcedureSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  procedureDate: z.string().datetime().optional(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; encounterId: string; procedureId: string } } // `id` is patientId
) {
  try {
    const record = await procedureService.getProcedureById(params.procedureId);
    if (!record || record.patientId !== params.id || record.encounterId !== params.encounterId) {
      return new NextResponse('Procedure record not found for this encounter', { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error('[PROCEDURE_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; encounterId: string; procedureId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await procedureService.getProcedureById(params.procedureId);
    if (!existingRecord || existingRecord.patientId !== params.id || existingRecord.encounterId !== params.encounterId) {
        return new NextResponse('Procedure record not found for this encounter', { status: 404 });
    }

    const body = await request.json();
    const validation = updateProcedureSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedRecord = await procedureService.updateProcedure(params.procedureId, validation.data);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('[PROCEDURE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; encounterId: string; procedureId: string } } // `id` is patientId
) {
  try {
    const existingRecord = await procedureService.getProcedureById(params.procedureId);
    if (!existingRecord || existingRecord.patientId !== params.id || existingRecord.encounterId !== params.encounterId) {
        return new NextResponse('Procedure record not found for this encounter', { status: 404 });
    }

    await procedureService.deleteProcedure(params.procedureId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PROCEDURE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}