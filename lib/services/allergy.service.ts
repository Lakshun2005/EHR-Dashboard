import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list allergies for a specific patient
export const listAllergiesForPatient = async (patientId: string) => {
  return await prisma.allergy.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
};

// Service to get a single allergy record by its ID
export const getAllergyById = async (id: string) => {
  return await prisma.allergy.findUnique({
    where: { id },
  });
};

// Service to create a new allergy record
export const createAllergy = async (data: Prisma.AllergyUncheckedCreateInput) => {
  return await prisma.allergy.create({
    data,
  });
};

// Service to update an allergy record
export const updateAllergy = async (id: string, data: Prisma.AllergyUncheckedUpdateInput) => {
  return await prisma.allergy.update({
    where: { id },
    data,
  });
};

// Service to delete an allergy record
export const deleteAllergy = async (id: string) => {
  return await prisma.allergy.delete({
    where: { id },
  });
};