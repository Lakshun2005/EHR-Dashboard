import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const assignedTo = searchParams.get("assigned_to")

  try {
    let query = supabase
      .from("tasks")
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(id, full_name, role),
        created_by_profile:profiles!tasks_created_by_fkey(id, full_name, role),
        patient:patients(id, first_name, last_name, medical_record_number)
      `)
      .order("created_at", { ascending: false })

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
  const supabase = createServerClient()
  const { title, description, priority, assigned_to, patient_id, due_date } = await request.json()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description,
        priority,
        assigned_to,
        patient_id,
        due_date,
        created_by: user.id,
        status: "pending",
      })
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(id, full_name, role),
        created_by_profile:profiles!tasks_created_by_fkey(id, full_name, role),
        patient:patients(id, first_name, last_name, medical_record_number)
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
  const supabase = createServerClient()
  const { id, status, ...updates } = await request.json()

  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .update({ status, ...updates })
      .eq("id", id)
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(id, full_name, role),
        created_by_profile:profiles!tasks_created_by_fkey(id, full_name, role),
        patient:patients(id, first_name, last_name, medical_record_number)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
