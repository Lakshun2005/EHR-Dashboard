import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list procedures for a specific patient
export const listProceduresForPatient = async (patientId: string) => {
  return await prisma.procedure.findMany({
    where: { patientId },
    orderBy: { procedureDate: 'desc' },
  });
};

// Service to get a single procedure by its ID
export const getProcedureById = async (id: string) => {
  return await prisma.procedure.findUnique({
    where: { id },
  });
};

// Service to create a new procedure
export const createProcedure = async (data: Prisma.ProcedureUncheckedCreateInput) => {
  return await prisma.procedure.create({
    data,
  });
};

// Service to update a procedure
export const updateProcedure = async (id: string, data: Prisma.ProcedureUncheckedUpdateInput) => {
  return await prisma.procedure.update({
    where: { id },
    data,
  });
};

// Service to delete a procedure
export const deleteProcedure = async (id: string) => {
  return await prisma.procedure.delete({
    where: { id },
  });
};