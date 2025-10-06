import { NextResponse } from 'next/server';
import * as procedureService from '@/lib/services/procedure.service';
import { z } from 'zod';

const procedureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  procedureDate: z.string().datetime(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string; encounterId: string } } // `id` is patientId
) {
  try {
    // The service lists by patient, so we'll adapt.
    const procedures = await procedureService.listProceduresForPatient(params.id);
    // Filter for the specific encounter
    const resultsForEncounter = procedures.filter(p => p.encounterId === params.encounterId);
    return NextResponse.json(resultsForEncounter);
  } catch (error) {
    console.error('[PROCEDURES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; encounterId: string } } // `id` is patientId
) {
  try {
    const body = await request.json();
    const validation = procedureSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id,
      encounterId: params.encounterId,
    };

    const newProcedure = await procedureService.createProcedure(data);
    return NextResponse.json(newProcedure, { status: 201 });
  } catch (error) {
    console.error('[PROCEDURES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}