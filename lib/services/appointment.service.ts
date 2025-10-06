import prisma from '@/lib/prisma';
import { Prisma, AppointmentStatus } from '@prisma/client';

// Service to list appointments with pagination and filtering
export const listAppointments = async ({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: AppointmentStatus }) => {
  const skip = (page - 1) * limit;
  const where: Prisma.AppointmentWhereInput = {};

  if (status) {
    where.status = status;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    skip,
    take: limit,
    orderBy: { appointmentDateTime: 'desc' },
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true }
      },
      provider: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  });

  const total = await prisma.appointment.count({ where });

  return {
    data: appointments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Service to get a single appointment by ID
export const getAppointmentById = async (id: string) => {
  return await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      provider: true,
    }
  });
};

// Service to create a new appointment
export const createAppointment = async (data: Prisma.AppointmentUncheckedCreateInput) => {
  return await prisma.appointment.create({ data });
};

// Service to update an existing appointment
export const updateAppointment = async (id: string, data: Prisma.AppointmentUncheckedUpdateInput) => {
  return await prisma.appointment.update({
    where: { id },
    data,
  });
};

// Service to delete an appointment
export const deleteAppointment = async (id:string) => {
  return await prisma.appointment.delete({
    where: { id },
  });
};