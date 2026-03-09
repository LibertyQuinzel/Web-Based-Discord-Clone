import { Router, Response } from 'express';
import { AuthService } from '../services/authService';
import { validate } from '../../utils/validation';
import { createUserSchema, loginSchema } from '../../utils/validation';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const authService = new AuthService();

// Register user
router.post('/register', validate(createUserSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token },
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    } as ApiResponse);
  }
}));

// Login user
router.post('/login', validate(loginSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    } as ApiResponse);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    } as ApiResponse);
  }
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      } as ApiResponse);
    }

    const { user, token } = await authService.refreshToken(req.user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { user, token },
    } as ApiResponse);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
    } as ApiResponse);
  }
}));

export default router;
