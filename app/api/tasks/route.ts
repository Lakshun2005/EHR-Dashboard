import { NextResponse } from 'next/server';
import * as taskService from '@/lib/services/task.service';
import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeId: z.string().uuid(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') as TaskStatus | undefined;
    const assigneeId = searchParams.get('assigneeId') || undefined;

    if (status && !Object.values(TaskStatus).includes(status)) {
        return new NextResponse('Invalid status filter', { status: 400 });
    }

    const result = await taskService.listTasks({ page, limit, status, assigneeId });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = taskSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const task = await taskService.createTask(validation.data);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('[TASKS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}