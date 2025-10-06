import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list all departments
export const listDepartments = async () => {
  return await prisma.department.findMany({
    orderBy: { name: 'asc' },
  });
};

// Service to get a single department by its ID
export const getDepartmentById = async (id: string) => {
  return await prisma.department.findUnique({
    where: { id },
    include: {
      beds: true,
      equipment: true,
    },
  });
};

// Service to create a new department
export const createDepartment = async (data: Prisma.DepartmentCreateInput) => {
  return await prisma.department.create({
    data,
  });
};

// Service to update a department
export const updateDepartment = async (id: string, data: Prisma.DepartmentUpdateInput) => {
  return await prisma.department.update({
    where: { id },
    data,
  });
};

// Service to delete a department
export const deleteDepartment = async (id: string) => {
  // Note: Deleting a department might fail if it has related records (beds, encounters, etc.)
  // depending on your database constraints.
  return await prisma.department.delete({
    where: { id },
  });
};