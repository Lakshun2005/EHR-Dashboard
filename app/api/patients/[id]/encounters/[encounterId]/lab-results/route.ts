import { NextResponse } from 'next/server';
import * as labResultService from '@/lib/services/labResult.service';
import { z } from 'zod';

const labResultSchema = z.object({
  testName: z.string().min(1),
  resultValue: z.string(),
  units: z.string().optional().nullable(),
  referenceRange: z.string().optional().nullable(),
  collectedAt: z.string().datetime(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string; encounterId: string } } // `id` is patientId
) {
  try {
    // This assumes you might want to list all lab results for an encounter.
    // The service currently lists by patient, so we'll adapt.
    // For now, let's stick to the patient-level listing.
    const labResults = await labResultService.listLabResultsForPatient(params.id);
    // You could further filter here by encounterId if needed.
    const resultsForEncounter = labResults.filter(lr => lr.encounterId === params.encounterId);
    return NextResponse.json(resultsForEncounter);
  } catch (error) {
    console.error('[LAB_RESULTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; encounterId: string } } // `id` is patientId
) {
  try {
    const body = await request.json();
    const validation = labResultSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id,
      encounterId: params.encounterId,
    };

    const newLabResult = await labResultService.createLabResult(data);
    return NextResponse.json(newLabResult, { status: 201 });
  } catch (error) {
    console.error('[LAB_RESULTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}