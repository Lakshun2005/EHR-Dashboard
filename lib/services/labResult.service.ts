import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list lab results for a specific patient
export const listLabResultsForPatient = async (patientId: string) => {
  return await prisma.labResult.findMany({
    where: { patientId },
    orderBy: { collectedAt: 'desc' },
  });
};

// Service to get a single lab result by its ID
export const getLabResultById = async (id: string) => {
  return await prisma.labResult.findUnique({
    where: { id },
  });
};

// Service to create a new lab result
export const createLabResult = async (data: Prisma.LabResultUncheckedCreateInput) => {
  return await prisma.labResult.create({
    data,
  });
};

// Service to update a lab result
export const updateLabResult = async (id: string, data: Prisma.LabResultUncheckedUpdateInput) => {
  return await prisma.labResult.update({
    where: { id },
    data,
  });
};

// Service to delete a lab result
export const deleteLabResult = async (id: string) => {
  return await prisma.labResult.delete({
    where: { id },
  });
};