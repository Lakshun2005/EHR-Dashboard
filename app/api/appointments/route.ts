import { NextResponse } from 'next/server';
import * as appointmentService from '@/lib/services/appointment.service';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  appointmentDateTime: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  reason: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') as AppointmentStatus | undefined;

    if (status && !Object.values(AppointmentStatus).includes(status)) {
        return new NextResponse('Invalid status filter', { status: 400 });
    }

    const result = await appointmentService.listAppointments({ page, limit, status });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[APPOINTMENTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = appointmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const appointment = await appointmentService.createAppointment(validation.data);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('[APPOINTMENTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}