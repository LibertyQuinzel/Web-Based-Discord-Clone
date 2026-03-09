import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User types
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Server types
export interface CreateServerInput {
  name: string;
  description?: string;
  icon?: string;
}

export interface ServerResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  memberCount?: number;
}

// Channel types
export interface CreateChannelInput {
  name: string;
  type: string;
  topic?: string;
  serverId: string;
}

export interface ChannelResponse {
  id: string;
  name: string;
  type: string;
  topic?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  serverId: string;
}

// Message types
export interface CreateMessageInput {
  content: string;
  channelId: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  channelId: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

// Direct Message types
export interface CreateDirectMessageInput {
  content: string;
  receiverId: string;
}

export interface DirectMessageResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  receiverId: string;
  sender?: {
    id: string;
    username: string;
    avatar?: string;
  };
  receiver?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

// JWT Payload type
export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Error types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}
