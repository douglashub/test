import { Router } from 'express';
import TopicController from '../controllers/topic.controller.js';
import authMiddleware from '../middlewares/auth.middleware';
import roleMiddleware from '../middlewares/role.middleware';
import { UserRole } from '../domain/entities/User';

const router = Router();

// CRUD Operations
router.post('/', 
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.EDITOR]),
  TopicController.createTopic
);

router.get('/:id', TopicController.getTopicById);

router.get('/:id/hierarchy', TopicController.getTopicHierarchy);

router.put('/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.EDITOR]),
  TopicController.updateTopic
);

router.delete('/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  TopicController.deleteTopic
);

export default router;