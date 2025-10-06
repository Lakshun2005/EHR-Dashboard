import { NextResponse } from 'next/server';
import * as appointmentService from '@/lib/services/appointment.service';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';

const updateAppointmentSchema = z.object({
  appointmentDateTime: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  reason: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
}).partial();


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await appointmentService.getAppointmentById(params.id);
    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('[APPOINTMENT_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const appointment = await appointmentService.updateAppointment(params.id, validation.data);
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('[APPOINTMENT_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await appointmentService.deleteAppointment(params.id);
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('[APPOINTMENT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}