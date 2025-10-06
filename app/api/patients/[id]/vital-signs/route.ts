import { NextResponse } from 'next/server';
import * as vitalSignService from '@/lib/services/vitalSign.service';
import { z } from 'zod';

const vitalSignSchema = z.object({
  timestamp: z.string().datetime().optional(),
  heartRate: z.number().int().optional().nullable(),
  bloodPressure: z.string().optional().nullable(),
  temperature: z.number().optional().nullable(),
  respiratoryRate: z.number().int().optional().nullable(),
  oxygenSaturation: z.number().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const vitalSigns = await vitalSignService.listVitalSignsForPatient(params.id);
    return NextResponse.json(vitalSigns);
  } catch (error) {
    console.error('[VITAL_SIGNS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const body = await request.json();
    const validation = vitalSignSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id,
    };

    const newVitalSign = await vitalSignService.createVitalSign(data);
    return NextResponse.json(newVitalSign, { status: 201 });
  } catch (error) {
    console.error('[VITAL_SIGNS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}