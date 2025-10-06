import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list patients with pagination and search
export const listPatients = async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }) => {
  const skip = (page - 1) * limit;
  const where: Prisma.PatientWhereInput = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { medicalRecordNumber: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const patients = await prisma.patient.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.patient.count({ where });

  return {
    data: patients,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Service to get a single patient by ID
export const getPatientById = async (id: string) => {
  return await prisma.patient.findUnique({
    where: { id },
    include: {
        medicalHistory: true,
        appointments: true,
        clinicalNotes: true,
    }
  });
};

// Service to create a new patient
export const createPatient = async (data: Prisma.PatientCreateInput) => {
  return await prisma.patient.create({ data });
};

// Service to update an existing patient
export const updatePatient = async (id: string, data: Prisma.PatientUpdateInput) => {
  return await prisma.patient.update({
    where: { id },
    data,
  });
};

// Service to delete a patient
export const deletePatient = async (id: string) => {
  return await prisma.patient.delete({
    where: { id },
  });
};