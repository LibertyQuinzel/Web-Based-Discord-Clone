import { Router, Response } from 'express';
import { MessageService } from '../services/messageService';
import { validate } from '../utils/validation';
import { createMessageSchema, updateMessageSchema } from '../utils/validation';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const messageService = new MessageService();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create message
router.post('/', validate(createMessageSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    } as ApiResponse);
  }

  try {
    const message = await messageService.createMessage(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: { message },
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create message',
    } as ApiResponse);
  }
}));

// Get channel messages
router.get('/channel/:channelId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const messages = await messageService.getChannelMessages(
      channelId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: { messages },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve messages',
    } as ApiResponse);
  }
}));

// Get messages after a specific message (for real-time updates)
router.get('/channel/:channelId/after/:messageId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { channelId, messageId } = req.params;
    const { limit = '50' } = req.query;

    const messages = await messageService.getMessagesAfter(
      channelId,
      messageId,
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: { messages },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve messages',
    } as ApiResponse);
  }
}));

// Get messages within time window (for summaries)
router.get('/channel/:channelId/window/:minutes', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { channelId, minutes } = req.params;
    const { limit = '100' } = req.query;

    const messages = await messageService.getMessagesWithinTimeWindow(
      channelId,
      parseInt(minutes),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: { messages },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve messages',
    } as ApiResponse);
  }
}));

// Search messages in channel
router.get('/channel/:channelId/search', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { q: query, limit = '20' } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      } as ApiResponse);
    }

    const messages = await messageService.searchMessages(channelId, query, parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Messages search completed',
      data: { messages },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search messages',
    } as ApiResponse);
  }
}));

// Get message by ID
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const message = await messageService.getMessageById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      message: 'Message retrieved successfully',
      data: { message },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve message',
    } as ApiResponse);
  }
}));

// Update message
router.put('/:id', validate(updateMessageSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content } = req.body;
    const message = await messageService.updateMessage(req.params.id, content);

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: { message },
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update message',
    } as ApiResponse);
  }
}));

// Delete message
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    await messageService.deleteMessage(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete message',
    } as ApiResponse);
  }
}));

export default router;
