import { Request, Response, NextFunction } from 'express';
import { Topic } from '../domain/entities/Topic';
import { topicRepository, topicHierarchyService } from '../config/services';

const TopicController = {
  createTopic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, content, parentTopicId } = req.body;
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
      topic ? res.json(topic) : res.status(404).json({ error: 'Topic not found' });
    } catch (error) {
      next(error);
    }
  },

  updateTopic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topic = await topicRepository.findById(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
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
        return res.status(404).json({ error: 'Topic not found' });
      }
      await topicRepository.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

export default TopicController;