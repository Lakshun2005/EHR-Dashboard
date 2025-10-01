import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  try {
    const { data: users, error } = await supabase
      .from("User")
      .select("id, firstName, lastName, role")
      .in("role", ["PHYSICIAN", "NURSE", "SPECIALIST", "ADMINISTRATOR"]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}