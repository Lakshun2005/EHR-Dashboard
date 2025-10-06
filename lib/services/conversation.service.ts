import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Service to list conversations for a specific user
export const listConversationsForUser = async (userId: string) => {
  return await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      members: {
        select: { id: true, firstName: true, lastName: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Include the latest message for context
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

// Service to get a single conversation by its ID, including all messages
export const getConversationById = async (id: string) => {
  return await prisma.conversation.findUnique({
    where: { id },
    include: {
      members: {
        select: { id: true, firstName: true, lastName: true },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });
};

// Service to create a new conversation
export const createConversation = async (title: string | null, memberIds: string[]) => {
  return await prisma.conversation.create({
    data: {
      title,
      members: {
        connect: memberIds.map(id => ({ id })),
      },
    },
  });
};

// Service to delete a conversation
export const deleteConversation = async (id: string) => {
  // This will also delete related messages due to the schema's cascading delete behavior.
  return await prisma.conversation.delete({
    where: { id },
  });
};