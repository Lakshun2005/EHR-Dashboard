import prisma from '@/lib/prisma';
import { Prisma, TaskStatus } from '@prisma/client';

// Service to list tasks with pagination and filtering
export const listTasks = async ({ page = 1, limit = 10, status, assigneeId }: { page?: number; limit?: number; status?: TaskStatus, assigneeId?: string }) => {
  const skip = (page - 1) * limit;
  const where: Prisma.TaskWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  const tasks = await prisma.task.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true }
      }
    }
  });

  const total = await prisma.task.count({ where });

  return {
    data: tasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Service to get a single task by ID
export const getTaskById = async (id: string) => {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: true,
    }
  });
};

// Service to create a new task
export const createTask = async (data: Prisma.TaskUncheckedCreateInput) => {
  return await prisma.task.create({ data });
};

// Service to update an existing task
export const updateTask = async (id: string, data: Prisma.TaskUncheckedUpdateInput) => {
  return await prisma.task.update({
    where: { id },
    data,
  });
};

// Service to delete a task
export const deleteTask = async (id:string) => {
  return await prisma.task.delete({
    where: { id },
  });
};