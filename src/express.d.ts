import { UserRole } from './domain/entities/User';

declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}