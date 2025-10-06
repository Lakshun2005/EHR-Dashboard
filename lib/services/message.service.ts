import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to create a new message in a conversation
export const createMessage = async (data: Prisma.MessageUncheckedCreateInput) => {
  // The logic to ensure the sender is a member of the conversation
  // should be handled in the API route before calling this service.

  // Creating a message also updates the 'updatedAt' timestamp of the parent conversation
  // to help with sorting conversations by recent activity.
  const newMessage = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data,
    });

    await tx.conversation.update({
      where: {
        id: data.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  });

  return newMessage;
};