import express, { Request, Response } from 'express';
import { register, login, getUserById, updateUser, deleteUser } from '../controllers/user.controller';  // Import the functions
import authMiddleware from '../middlewares/auth.middleware';
import roleMiddleware from '../middlewares/role.middleware';
import { UserRole } from '../domain/entities/User';

const router = express.Router();

// Registration - no auth required
router.post('/register', register);

// Login - no auth required
router.post('/login', login);

// Protected routes
router.get('/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]),
  getUserById
);

router.patch('/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  updateUser
);

router.delete('/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  deleteUser
);

export default router;
