import { NextResponse } from 'next/server';
import * as clinicalNoteService from '@/lib/services/clinicalNote.service';
import { z } from 'zod';

const updateClinicalNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  noteType: z.string().optional(),
}).partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string; noteId: string } } // `id` is patientId
) {
  try {
    const note = await clinicalNoteService.getClinicalNoteById(params.noteId);
    // Ensure the note belongs to the correct patient
    if (!note || note.patientId !== params.id) {
      return new NextResponse('Clinical note not found for this patient', { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    console.error('[CLINICAL_NOTE_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; noteId: string } } // `id` is patientId
) {
  try {
    const existingNote = await clinicalNoteService.getClinicalNoteById(params.noteId);
    if (!existingNote || existingNote.patientId !== params.id) {
        return new NextResponse('Clinical note not found for this patient', { status: 404 });
    }

    const body = await request.json();
    const validation = updateClinicalNoteSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const updatedNote = await clinicalNoteService.updateClinicalNote(params.noteId, validation.data);
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('[CLINICAL_NOTE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; noteId: string } } // `id` is patientId
) {
  try {
    const existingNote = await clinicalNoteService.getClinicalNoteById(params.noteId);
    if (!existingNote || existingNote.patientId !== params.id) {
        return new NextResponse('Clinical note not found for this patient', { status: 404 });
    }

    await clinicalNoteService.deleteClinicalNote(params.noteId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CLINICAL_NOTE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}