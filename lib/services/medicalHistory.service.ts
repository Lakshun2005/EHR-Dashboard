import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list medical history records for a specific patient
export const listMedicalHistoryForPatient = async (patientId: string) => {
  return await prisma.medicalHistory.findMany({
    where: { patientId },
    orderBy: { diagnosisDate: 'desc' },
  });
};

// Service to get a single medical history record by its ID
export const getMedicalHistoryById = async (id: string) => {
  return await prisma.medicalHistory.findUnique({
    where: { id },
  });
};

// Service to create a new medical history record
export const createMedicalHistory = async (data: Prisma.MedicalHistoryUncheckedCreateInput) => {
  return await prisma.medicalHistory.create({
    data,
  });
};

// Service to update a medical history record
export const updateMedicalHistory = async (id: string, data: Prisma.MedicalHistoryUncheckedUpdateInput) => {
  return await prisma.medicalHistory.update({
    where: { id },
    data,
  });
};

// Service to delete a medical history record
export const deleteMedicalHistory = async (id: string) => {
  return await prisma.medicalHistory.delete({
    where: { id },
  });
};