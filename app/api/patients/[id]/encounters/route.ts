import { NextResponse } from 'next/server';
import * as encounterService from '@/lib/services/encounter.service';
import { z } from 'zod';
import { EncounterStatus, EncounterType } from '@prisma/client';

const encounterSchema = z.object({
  providerId: z.string().uuid(),
  departmentId: z.string().uuid(),
  bedId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(EncounterStatus),
  type: z.nativeEnum(EncounterType),
  reason: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as EncounterType | undefined;
    const status = searchParams.get('status') as EncounterStatus | undefined;

    if (type && !Object.values(EncounterType).includes(type)) {
        return new NextResponse('Invalid type filter', { status: 400 });
    }
    if (status && !Object.values(EncounterStatus).includes(status)) {
        return new NextResponse('Invalid status filter', { status: 400 });
    }

    const encounters = await encounterService.listEncountersForPatient(params.id, { type, status });
    return NextResponse.json(encounters);
  } catch (error) {
    console.error('[ENCOUNTERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const body = await request.json();
    const validation = encounterSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id,
    };

    const newEncounter = await encounterService.createEncounter(data);
    return NextResponse.json(newEncounter, { status: 201 });
  } catch (error) {
    console.error('[ENCOUNTERS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}