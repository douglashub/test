import { Topic } from '../entities/Topic';
import { TopicRepository } from '../repositories/TopicRepository';

export class TopicHierarchyService {
  constructor(private readonly topicRepository: TopicRepository) {}

  async getTopicHierarchy(rootTopicId: string): Promise<TopicHierarchyNode> {
    const topic = await this.topicRepository.findById(rootTopicId);
    if (!topic) {
      throw new Error(`Topic with id ${rootTopicId} not found`);
    }

    return this.buildHierarchyNode(topic);
  }

  private async buildHierarchyNode(topic: Topic): Promise<TopicHierarchyNode> {
    const childTopics = await this.topicRepository.findByParentId(topic.getId());
    const children: TopicHierarchyNode[] = [];

    for (const childTopic of childTopics) {
      children.push(await this.buildHierarchyNode(childTopic));
    }

    return {
      id: topic.getId(),
      name: topic.getName(),
      version: topic.getVersion(),
      children
    };
  }

  async findShortestPath(startTopicId: string, endTopicId: string): Promise<string[]> {
    const visited = new Set<string>();
    const queue: { topicId: string; path: string[] }[] = [];
    
    queue.push({ topicId: startTopicId, path: [startTopicId] });
    visited.add(startTopicId);

    while (queue.length > 0) {
      const { topicId, path } = queue.shift()!;
      
      if (topicId === endTopicId) {
        return path;
      }

      const topic = await this.topicRepository.findById(topicId);
      if (!topic) continue;

      // Check parent topic
      const parentId = topic.getParentTopicId();
      if (parentId && !visited.has(parentId)) {
        queue.push({ topicId: parentId, path: [...path, parentId] });
        visited.add(parentId);
      }

      // Check child topics
      const childTopics = await this.topicRepository.findByParentId(topicId);
      for (const childTopic of childTopics) {
        const childId = childTopic.getId();
        if (!visited.has(childId)) {
          queue.push({ topicId: childId, path: [...path, childId] });
          visited.add(childId);
        }
      }
    }

    throw new Error(`No path found between topics ${startTopicId} and ${endTopicId}`);
  }
}

interface TopicHierarchyNode {
  id: string;
  name: string;
  version: number;
  children: TopicHierarchyNode[];
}