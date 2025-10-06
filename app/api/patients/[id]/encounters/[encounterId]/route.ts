import { NextResponse } from 'next/server';
import * as encounterService from '@/lib/services/encounter.service';
import { z } from 'zod';
import { EncounterStatus, EncounterType } from '@prisma/client';

const updateEncounterSchema = z.object({
  providerId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  bedId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(EncounterStatus).optional(),
  type: z.nativeEnum(EncounterType).optional(),
  reason: z.string().optional().nullable(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional().nullable(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; encounterId: string } } // `id` is patientId
) {
  try {
    const encounter = await encounterService.getEncounterById(params.encounterId);
    // Ensure the encounter belongs to the correct patient
    if (!encounter || encounter.patientId !== params.id) {
      return new NextResponse('Encounter not found for this patient', { status: 404 });
    }
    return NextResponse.json(encounter);
  } catch (error) {
    console.error('[ENCOUNTER_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; encounterId: string } } // `id` is patientId
) {
  try {
    const existingEncounter = await encounterService.getEncounterById(params.encounterId);
    if (!existingEncounter || existingEncounter.patientId !== params.id) {
        return new NextResponse('Encounter not found for this patient', { status: 404 });
    }

    const body = await request.json();
    const validation = updateEncounterSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedEncounter = await encounterService.updateEncounter(params.encounterId, validation.data);
    return NextResponse.json(updatedEncounter);
  } catch (error) {
    console.error('[ENCOUNTER_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; encounterId: string } } // `id` is patientId
) {
  try {
    const existingEncounter = await encounterService.getEncounterById(params.encounterId);
    if (!existingEncounter || existingEncounter.patientId !== params.id) {
        return new NextResponse('Encounter not found for this patient', { status: 404 });
    }

    await encounterService.deleteEncounter(params.encounterId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ENCOUNTER_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}