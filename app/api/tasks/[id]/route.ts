import { NextResponse } from 'next/server';
import * as taskService from '@/lib/services/task.service';
import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional().nullable(),
    assigneeId: z.string().uuid().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    dueDate: z.string().datetime().optional().nullable(),
}).partial();


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    console.error('[TASK_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const task = await taskService.updateTask(params.id, validation.data);
    return NextResponse.json(task);
  } catch (error) {
    console.error('[TASK_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await taskService.deleteTask(params.id);
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('[TASK_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}