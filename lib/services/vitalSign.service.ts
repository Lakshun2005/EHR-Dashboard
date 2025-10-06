import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list vital signs for a specific patient
export const listVitalSignsForPatient = async (patientId: string) => {
  return await prisma.vitalSign.findMany({
    where: { patientId },
    orderBy: { timestamp: 'desc' },
  });
};

// Service to get a single vital sign record by its ID
export const getVitalSignById = async (id: string) => {
  return await prisma.vitalSign.findUnique({
    where: { id },
  });
};

// Service to create a new vital sign record
export const createVitalSign = async (data: Prisma.VitalSignUncheckedCreateInput) => {
  return await prisma.vitalSign.create({
    data,
  });
};

// Service to update a vital sign record
export const updateVitalSign = async (id: string, data: Prisma.VitalSignUncheckedUpdateInput) => {
  return await prisma.vitalSign.update({
    where: { id },
    data,
  });
};

// Service to delete a vital sign record
export const deleteVitalSign = async (id: string) => {
  return await prisma.vitalSign.delete({
    where: { id },
  });
};