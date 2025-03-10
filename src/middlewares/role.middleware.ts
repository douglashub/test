import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../domain/entities/User';

export default function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(403).json({ error: 'User not authenticated' });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}