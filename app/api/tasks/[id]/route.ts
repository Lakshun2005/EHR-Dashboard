import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const task = await prisma.backgroundTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}