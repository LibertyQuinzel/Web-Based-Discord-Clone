import prisma from './prisma';
import { CreateServerInput, ServerResponse } from '../types';

export class ServerService {
  async createServer(serverData: CreateServerInput, creatorId: string): Promise<ServerResponse> {
    const { name, description, icon } = serverData;

    const server = await prisma.server.create({
      data: {
        name,
        description,
        icon,
        creatorId,
        members: {
          create: {
            userId: creatorId,
            role: 'admin',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Transform the response to match the expected format
    const response: ServerResponse = {
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      creatorId: server.creatorId,
      memberCount: server.members.length,
    };

    return response;
  }

  async getServerById(id: string): Promise<ServerResponse | null> {
    const server = await prisma.server.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!server) {
      return null;
    }

    const response: ServerResponse = {
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      creatorId: server.creatorId,
      memberCount: server.members.length,
    };

    return response;
  }

  async getUserServers(userId: string): Promise<ServerResponse[]> {
    const servers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    return servers.map(server => ({
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      creatorId: server.creatorId,
      memberCount: server.members.length,
    }));
  }

  async updateServer(id: string, updateData: Partial<ServerResponse>): Promise<ServerResponse> {
    const server = await prisma.server.update({
      where: { id },
      data: updateData,
      include: {
        members: true,
      },
    });

    const response: ServerResponse = {
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      creatorId: server.creatorId,
      memberCount: server.members.length,
    };

    return response;
  }

  async deleteServer(id: string): Promise<void> {
    await prisma.server.delete({
      where: { id },
    });
  }

  async searchServers(query: string, userId: string, limit: number = 10): Promise<ServerResponse[]> {
    const servers = await prisma.server.findMany({
      where: {
        AND: [
          {
            members: {
              some: {
                userId,
              },
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      include: {
        members: true,
      },
      take: limit,
    });

    return servers.map(server => ({
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      creatorId: server.creatorId,
      memberCount: server.members.length,
    }));
  }

  async addServerMember(serverId: string, userId: string, role: string = 'member'): Promise<void> {
    await prisma.serverMember.create({
      data: {
        serverId,
        userId,
        role,
      },
    });
  }

  async removeServerMember(serverId: string, userId: string): Promise<void> {
    await prisma.serverMember.delete({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
    });
  }

  async updateServerMemberRole(serverId: string, userId: string, role: string): Promise<void> {
    await prisma.serverMember.update({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
      data: { role },
    });
  }

  async getServerMembers(serverId: string): Promise<any[]> {
    const members = await prisma.serverMember.findMany({
      where: { serverId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    return members.map(member => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    }));
  }
}
