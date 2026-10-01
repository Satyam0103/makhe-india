import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/Admin';

export interface AdminPayload {
  id: string;
  email: string;
  role: 'admin';
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
    }
    return 'makhe_dev_jwt_secret_change_in_production_1001';
  }
  return secret;
}

/**
 * Middleware to verify JWT authentication for admin routes.
 */
export async function adminAuth(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization required. Please provide a valid Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AdminPayload;

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.',
      });
    }

    // Attach verified admin identity to request object
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
}

export default adminAuth;
