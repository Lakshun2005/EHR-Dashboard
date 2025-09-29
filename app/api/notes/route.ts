import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, noteType, patientId, encounterId } = body

    if (!title || !content || !noteType || !patientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newNote = await prisma.clinicalNote.create({
      data: {
        title,
        content,
        noteType,
        patientId,
        authorId: user.id, // Use the authenticated user's ID
        encounterId, // This can be optional
      },
    })

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Error creating clinical note:", error)
    return NextResponse.json({ error: "Failed to create clinical note" }, { status: 500 })
  }
}