import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list clinical notes for a specific patient
export const listClinicalNotesForPatient = async (patientId: string) => {
  return await prisma.clinicalNote.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });
};

// Service to get a single clinical note by its ID
export const getClinicalNoteById = async (id: string) => {
  return await prisma.clinicalNote.findUnique({
    where: { id },
    include: {
        author: true,
        patient: true,
    }
  });
};

// Service to create a new clinical note
export const createClinicalNote = async (data: Prisma.ClinicalNoteUncheckedCreateInput) => {
  return await prisma.clinicalNote.create({
    data,
  });
};

// Service to update a clinical note
export const updateClinicalNote = async (id: string, data: Prisma.ClinicalNoteUncheckedUpdateInput) => {
  return await prisma.clinicalNote.update({
    where: { id },
    data,
  });
};

// Service to delete a clinical note
export const deleteClinicalNote = async (id: string) => {
  return await prisma.clinicalNote.delete({
    where: { id },
  });
};