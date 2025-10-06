import { NextResponse } from 'next/server';
import * as messageService from '@/lib/services/message.service';
import * as conversationService from '@/lib/services/conversation.service'; // To verify membership
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const messageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // `id` is the conversationId
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Verify the user is a member of the conversation
    const conversation = await conversationService.getConversationById(params.id);
    const isMember = conversation?.members.some(member => member.id === user.id);
    if (!conversation || !isMember) {
      return new NextResponse('You are not a member of this conversation', { status: 403 });
    }

    // 2. Validate the request body
    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    // 3. Create the message
    const data = {
      ...validation.data,
      conversationId: params.id,
      senderId: user.id,
    };

    const newMessage = await messageService.createMessage(data);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('[MESSAGES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}