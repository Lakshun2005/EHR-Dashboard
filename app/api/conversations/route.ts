import { NextResponse } from 'next/server';
import * as conversationService from '@/lib/services/conversation.service';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const conversationSchema = z.object({
  title: z.string().optional().nullable(),
  memberIds: z.array(z.string().uuid()).min(1, "At least one member is required"),
});

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversations = await conversationService.listConversationsForUser(user.id);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('[CONVERSATIONS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = conversationSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    // Ensure the current user is part of the conversation members
    const memberIds = [...new Set([...validation.data.memberIds, user.id])];

    const newConversation = await conversationService.createConversation(validation.data.title, memberIds);
    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error('[CONVERSATIONS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}