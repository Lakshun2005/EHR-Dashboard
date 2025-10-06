import { NextResponse } from 'next/server';
import * as conversationService from '@/lib/services/conversation.service';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversation = await conversationService.getConversationById(params.id);

    // Ensure the current user is a member of the conversation
    const isMember = conversation?.members.some(member => member.id === user.id);
    if (!conversation || !isMember) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('[CONVERSATION_DETAIL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversation = await conversationService.getConversationById(params.id);
    const isMember = conversation?.members.some(member => member.id === user.id);
    if (!conversation || !isMember) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    await conversationService.deleteConversation(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CONVERSATION_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}