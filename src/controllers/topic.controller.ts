import { Request, Response, NextFunction } from 'express';
import { Topic } from '../domain/entities/Topic';
import { topicRepository, topicHierarchyService } from '../config/services';

const TopicController = {
  createTopic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, content, parentTopicId } = req.body;
      
      if (!name || !content) {
        return res.status(400).json({
          success: false, 
          error: { message: 'Name and content are required' }
        });
      }
      
      const topic = Topic.create(name, content, parentTopicId);
      await topicRepository.save(topic);
      res.status(201).json(topic);
    } catch (error) {
      next(error);
    }
  },

  getTopicHierarchy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hierarchy = await topicHierarchyService.getTopicHierarchy(req.params.id);
      res.json(hierarchy);
    } catch (error) {
      next(error);
    }
  },

  getTopicById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topic = await topicRepository.findById(req.params.id);
      if (!topic) {
        return res.status(404).json({ 
          success: false,
          error: { message: 'Topic not found' }
        });
      }
      res.json(topic);
    } catch (error) {
      next(error);
    }
  },

  updateTopic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topic = await topicRepository.findById(req.params.id);
      if (!topic) {
        return res.status(404).json({ 
          success: false, 
          error: { message: 'Topic not found' }
        });
      }
      const updatedTopic = topic.createNewVersion(req.body.content);
      await topicRepository.save(updatedTopic);
      res.json(updatedTopic);
    } catch (error) {
      next(error);
    }
  },

  deleteTopic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exists = await topicRepository.exists(req.params.id);
      if (!exists) {
        return res.status(404).json({ 
          success: false, 
          error: { message: 'Topic not found' }
        });
      }
      await topicRepository.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  
  findShortestPath: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startId, endId } = req.query;

      if (!startId || !endId) {
        return res.status(400).json({
          success: false,
          error: { message: 'startId and endId are required' }
        });
      }

      const path = await topicHierarchyService.findShortestPath(
        startId as string,
        endId as string
      );

      res.json({ path });
    } catch (error: any) {
      if (error.message.includes('No path found')) {
        return res.status(404).json({
          success: false,
          error: { message: error.message }
        });
      }
      next(error);
    }
  }
};

export default TopicController;