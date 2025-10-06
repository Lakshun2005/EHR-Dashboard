import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list medications for a specific patient
export const listMedicationsForPatient = async (patientId: string) => {
  return await prisma.medication.findMany({
    where: { patientId },
    orderBy: { startDate: 'desc' },
  });
};

// Service to get a single medication record by its ID
export const getMedicationById = async (id: string) => {
  return await prisma.medication.findUnique({
    where: { id },
  });
};

// Service to create a new medication record
export const createMedication = async (data: Prisma.MedicationUncheckedCreateInput) => {
  return await prisma.medication.create({
    data,
  });
};

// Service to update a medication record
export const updateMedication = async (id: string, data: Prisma.MedicationUncheckedUpdateInput) => {
  return await prisma.medication.update({
    where: { id },
    data,
  });
};

// Service to delete a medication record
export const deleteMedication = async (id: string) => {
  return await prisma.medication.delete({
    where: { id },
  });
};