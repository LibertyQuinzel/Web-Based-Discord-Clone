import Joi from 'joi';

// User validation schemas
export const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  avatar: Joi.string().uri().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Server validation schemas
export const createServerSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  icon: Joi.string().uri().optional(),
});

export const updateServerSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  icon: Joi.string().uri().optional(),
});

// Channel validation schemas
export const createChannelSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('text', 'voice', 'category').required(),
  topic: Joi.string().max(1024).optional(),
  serverId: Joi.string().required(),
});

// Message validation schemas
export const createMessageSchema = Joi.object({
  content: Joi.string().min(1).max(4000).required(),
  channelId: Joi.string().required(),
});

export const updateMessageSchema = Joi.object({
  content: Joi.string().min(1).max(4000).required(),
});

// Direct message validation schemas
export const createDirectMessageSchema = Joi.object({
  content: Joi.string().min(1).max(4000).required(),
  receiverId: Joi.string().required(),
});

export const updateDirectMessageSchema = Joi.object({
  content: Joi.string().min(1).max(4000).required(),
});

// Server member validation schemas
export const addServerMemberSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('member', 'admin', 'moderator').optional(),
});

export const updateServerMemberSchema = Joi.object({
  role: Joi.string().valid('member', 'admin', 'moderator').required(),
});

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }
    next();
  };
};
