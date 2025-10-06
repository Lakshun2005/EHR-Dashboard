import { NextResponse } from 'next/server';
import * as bedService from '@/lib/services/bed.service';
import { z } from 'zod';

const bedSchema = z.object({
  bedNumber: z.string().min(1),
  isOccupied: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `id` is the departmentId
) {
  try {
    const beds = await bedService.listBedsInDepartment(params.id);
    return NextResponse.json(beds);
  } catch (error) {
    console.error('[BEDS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the departmentId
) {
  try {
    const body = await request.json();
    const validation = bedSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      departmentId: params.id,
    };

    const newBed = await bedService.createBed(data);
    return NextResponse.json(newBed, { status: 201 });
  } catch (error) {
    console.error('[BEDS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}