import { NextResponse } from 'next/server';
import * as departmentService from '@/lib/services/department.service';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const departments = await departmentService.listDepartments();
    return NextResponse.json(departments);
  } catch (error) {
    console.error('[DEPARTMENTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = departmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const newDepartment = await departmentService.createDepartment(validation.data);
    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error('[DEPARTMENTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}