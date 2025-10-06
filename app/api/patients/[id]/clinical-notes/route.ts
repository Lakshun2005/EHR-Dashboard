import { NextResponse } from 'next/server';
import * as clinicalNoteService from '@/lib/services/clinicalNote.service';
import { z } from 'zod';

const clinicalNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  noteType: z.string(),
  authorId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const notes = await clinicalNoteService.listClinicalNotesForPatient(params.id);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('[CLINICAL_NOTES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the patientId
) {
  try {
    const body = await request.json();
    const validation = clinicalNoteSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const data = {
      ...validation.data,
      patientId: params.id,
    };

    const newNote = await clinicalNoteService.createClinicalNote(data);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('[CLINICAL_NOTES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}