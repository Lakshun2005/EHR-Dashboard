import prisma from '@/lib/prisma';
import { Prisma, EncounterStatus, EncounterType } from '@prisma/client';

// Service to list encounters for a specific patient
export const listEncountersForPatient = async (patientId: string, { type, status }: { type?: EncounterType, status?: EncounterStatus }) => {
  const where: Prisma.EncounterWhereInput = { patientId };
  if (type) {
    where.type = type;
  }
  if (status) {
    where.status = status;
  }

  return await prisma.encounter.findMany({
    where,
    orderBy: { startTime: 'desc' },
    include: {
      provider: { select: { id: true, firstName: true, lastName: true } },
      department: { select: { id: true, name: true } },
    }
  });
};

// Service to get a single encounter by its ID
export const getEncounterById = async (id: string) => {
  return await prisma.encounter.findUnique({
    where: { id },
    include: {
        provider: true,
        patient: true,
        department: true,
        notes: true,
        labResults: true,
        procedures: true,
    }
  });
};

// Service to create a new encounter
export const createEncounter = async (data: Prisma.EncounterUncheckedCreateInput) => {
  return await prisma.encounter.create({
    data,
  });
};

// Service to update an encounter
export const updateEncounter = async (id: string, data: Prisma.EncounterUncheckedUpdateInput) => {
  return await prisma.encounter.update({
    where: { id },
    data,
  });
};

// Service to delete an encounter
export const deleteEncounter = async (id: string) => {
  return await prisma.encounter.delete({
    where: { id },
  });
};