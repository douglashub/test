// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../domain/entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        permissions: string[];
      };
    }
  }
}

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: { message: 'Unauthorized - Missing token' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Use environment variable or fallback for testing
    const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      role: UserRole; 
      permissions: string[] 
    };
    
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      permissions: decoded.permissions
    };
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: { message: 'Unauthorized - Invalid token' }
    });
  }
}