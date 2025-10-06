import { NextResponse } from 'next/server';
import * as departmentService from '@/lib/services/department.service';
import { z } from 'zod';

const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const department = await departmentService.getDepartmentById(params.id);
    if (!department) {
      return new NextResponse('Department not found', { status: 404 });
    }
    return NextResponse.json(department);
  } catch (error) {
    console.error('[DEPARTMENT_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateDepartmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedDepartment = await departmentService.updateDepartment(params.id, validation.data);
    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('[DEPARTMENT_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await departmentService.deleteDepartment(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DEPARTMENT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}