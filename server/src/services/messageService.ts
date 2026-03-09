import prisma from './prisma';
import { CreateMessageInput, MessageResponse } from '../types';

export class MessageService {
  async createMessage(messageData: CreateMessageInput, authorId: string): Promise<MessageResponse> {
    const { content, channelId } = messageData;

    const message = await prisma.message.create({
      data: {
        content,
        authorId,
        channelId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  }

  async getMessageById(id: string): Promise<MessageResponse | null> {
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  }

  async getChannelMessages(
    channelId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageResponse[]> {
    const messages = await prisma.message.findMany({
      where: { channelId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    });

    return messages;
  }

  async getMessagesAfter(
    channelId: string,
    messageId: string,
    limit: number = 50
  ): Promise<MessageResponse[]> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { createdAt: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        createdAt: {
          gt: message.createdAt,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    return messages;
  }

  async getMessagesWithinTimeWindow(
    channelId: string,
    timeWindowMinutes: number,
    limit: number = 100
  ): Promise<MessageResponse[]> {
    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        createdAt: {
          gte: timeWindow,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    return messages;
  }

  async updateMessage(id: string, content: string): Promise<MessageResponse> {
    const message = await prisma.message.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  }

  async deleteMessage(id: string): Promise<void> {
    await prisma.message.delete({
      where: { id },
    });
  }

  async searchMessages(
    channelId: string,
    query: string,
    limit: number = 20
  ): Promise<MessageResponse[]> {
    const messages = await prisma.message.findMany({
      where: {
        channelId,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return messages;
  }
}
