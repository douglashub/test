// src/config/services.ts
import { TopicHierarchyService } from '../domain/services/TopicHierarchyService';
import { InMemoryTopicRepository } from '../infrastructure/repositories/InMemoryTopicRepository';

export const topicRepository = new InMemoryTopicRepository();
export const topicHierarchyService = new TopicHierarchyService(topicRepository);