import { NextResponse } from 'next/server';
import * as allergyService from '@/lib/services/allergy.service';
import { z } from 'zod';
import { RiskLevel } from '@prisma/client';

const allergySchema = z.object({
  substance: z.string().min(1),
  reaction: z.string().min(1),
  severity: z.nativeEnum(RiskLevel),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const allergies = await allergyService.listAllergiesForPatient(params.id);
    return NextResponse.json(allergies);
  } catch (error) {
    console.error('[ALLERGIES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const body = await request.json();
    const validation = allergySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id,
    };

    const newAllergy = await allergyService.createAllergy(data);
    return NextResponse.json(newAllergy, { status: 201 });
  } catch (error) {
    console.error('[ALLERGIES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}