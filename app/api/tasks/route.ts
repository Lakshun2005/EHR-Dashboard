import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const assignedTo = searchParams.get("assigned_to")

  try {
    let query = supabase
      .from("Task")
      .select(`
        id,
        title,
        description,
        status,
        dueDate,
        assignee:User!Task_assigneeId_fkey(id, firstName, lastName),
        patient:Patient(id, firstName, lastName, medicalRecordNumber)
      `)
      .order("createdAt", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }
    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo)
    }

    const { data: tasks, error } = await query

    if (error) throw error

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { title, description, status, dueDate, assigneeId, patientId } = await request.json()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: task, error } = await supabase
      .from("Task")
      .insert({
        title,
        description,
        status,
        dueDate,
        assigneeId,
        patientId,
      })
      .select(`
        id,
        title,
        description,
        status,
        dueDate,
        assignee:User!Task_assigneeId_fkey(id, firstName, lastName),
        patient:Patient(id, firstName, lastName, medicalRecordNumber)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { id, ...updates } = await request.json()

  try {
    const { data: task, error } = await supabase
      .from("Task")
      .update(updates)
      .eq("id", id)
      .select(`
        id,
        title,
        description,
        status,
        dueDate,
        assignee:User!Task_assigneeId_fkey(id, firstName, lastName),
        patient:Patient(id, firstName, lastName, medicalRecordNumber)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
