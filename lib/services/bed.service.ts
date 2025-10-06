import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list all beds in a specific department
export const listBedsInDepartment = async (departmentId: string) => {
  return await prisma.bed.findMany({
    where: { departmentId },
    orderBy: { bedNumber: 'asc' },
  });
};

// Service to get a single bed by its ID
export const getBedById = async (id: string) => {
  return await prisma.bed.findUnique({
    where: { id },
  });
};

// Service to create a new bed
export const createBed = async (data: Prisma.BedUncheckedCreateInput) => {
  return await prisma.bed.create({
    data,
  });
};

// Service to update a bed
export const updateBed = async (id: string, data: Prisma.BedUncheckedUpdateInput) => {
  return await prisma.bed.update({
    where: { id },
    data,
  });
};

// Service to delete a bed
export const deleteBed = async (id: string) => {
  return await prisma.bed.delete({
    where: { id },
  });
};