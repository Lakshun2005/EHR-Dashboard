import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get("conversation_id")

  try {
    let query = supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, role),
        conversation:conversations(id, name, type)
      `)
      .order("created_at", { ascending: true })

    if (conversationId) {
      query = query.eq("conversation_id", conversationId)
    }

    const { data: messages, error } = await query

    if (error) throw error

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { conversation_id, content, message_type = "text" } = await request.json()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        content,
        message_type,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, role)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
