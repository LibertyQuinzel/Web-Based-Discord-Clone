import { Router, Response } from 'express';
import { ServerService } from '../services/serverService';
import { validate } from '../utils/validation';
import { createServerSchema, updateServerSchema, addServerMemberSchema, updateServerMemberSchema } from '../utils/validation';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const serverService = new ServerService();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create server
router.post('/', validate(createServerSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    } as ApiResponse);
  }

  try {
    const server = await serverService.createServer(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Server created successfully',
      data: { server },
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create server',
    } as ApiResponse);
  }
}));

// Get user's servers
router.get('/user', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    } as ApiResponse);
  }

  try {
    const servers = await serverService.getUserServers(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Servers retrieved successfully',
      data: { servers },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve servers',
    } as ApiResponse);
  }
}));

// Search servers
router.get('/search', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    } as ApiResponse);
  }

  try {
    const { q: query, limit = '10' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      } as ApiResponse);
    }

    const servers = await serverService.searchServers(query, req.user.id, parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Servers search completed',
      data: { servers },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search servers',
    } as ApiResponse);
  }
}));

// Get server by ID
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const server = await serverService.getServerById(req.params.id);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found',
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      message: 'Server retrieved successfully',
      data: { server },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve server',
    } as ApiResponse);
  }
}));

// Update server
router.put('/:id', validate(updateServerSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const server = await serverService.updateServer(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Server updated successfully',
      data: { server },
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update server',
    } as ApiResponse);
  }
}));

// Delete server
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    await serverService.deleteServer(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Server deleted successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete server',
    } as ApiResponse);
  }
}));

// Get server members
router.get('/:id/members', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const members = await serverService.getServerMembers(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Server members retrieved successfully',
      data: { members },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve server members',
    } as ApiResponse);
  }
}));

// Add server member
router.post('/:id/members', validate(addServerMemberSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, role } = req.body;
    await serverService.addServerMember(req.params.id, userId, role);

    res.status(201).json({
      success: true,
      message: 'Server member added successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add server member',
    } as ApiResponse);
  }
}));

// Update server member role
router.put('/:id/members/:userId', validate(updateServerMemberSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.body;
    await serverService.updateServerMemberRole(req.params.id, req.params.userId, role);

    res.status(200).json({
      success: true,
      message: 'Server member role updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update server member role',
    } as ApiResponse);
  }
}));

// Remove server member
router.delete('/:id/members/:userId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    await serverService.removeServerMember(req.params.id, req.params.userId);

    res.status(200).json({
      success: true,
      message: 'Server member removed successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove server member',
    } as ApiResponse);
  }
}));

export default router;
