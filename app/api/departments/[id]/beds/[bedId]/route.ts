import { NextResponse } from 'next/server';
import * as bedService from '@/lib/services/bed.service';
import { z } from 'zod';

const updateBedSchema = z.object({
  bedNumber: z.string().min(1).optional(),
  isOccupied: z.boolean().optional(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; bedId: string } } // `id` is departmentId
) {
  try {
    const record = await bedService.getBedById(params.bedId);
    // Ensure the bed belongs to the correct department
    if (!record || record.departmentId !== params.id) {
      return new NextResponse('Bed not found in this department', { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error('[BED_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; bedId: string } } // `id` is departmentId
) {
  try {
    const existingRecord = await bedService.getBedById(params.bedId);
    if (!existingRecord || existingRecord.departmentId !== params.id) {
        return new NextResponse('Bed not found in this department', { status: 404 });
    }

    const body = await request.json();
    const validation = updateBedSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedRecord = await bedService.updateBed(params.bedId, validation.data);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('[BED_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; bedId: string } } // `id` is departmentId
) {
  try {
    const existingRecord = await bedService.getBedById(params.bedId);
    if (!existingRecord || existingRecord.departmentId !== params.id) {
        return new NextResponse('Bed not found in this department', { status: 404 });
    }

    await bedService.deleteBed(params.bedId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[BED_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}