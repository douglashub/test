import { Resource } from '../../domain/entities/Resource';
import { ResourceRepository } from '../../domain/repositories/ResourceRepository';

export class InMemoryResourceRepository implements ResourceRepository {
  private resources: Map<string, Resource>;
  private topicResources: Map<string, Set<string>>;

  constructor() {
    this.resources = new Map<string, Resource>();
    this.topicResources = new Map<string, Set<string>>();
  }

  async save(resource: Resource): Promise<void> {
    this.resources.set(resource.getId(), resource);
    
    const topicId = resource.getTopicId();
    const resourcesForTopic = this.topicResources.get(topicId) || new Set<string>();
    resourcesForTopic.add(resource.getId());
    this.topicResources.set(topicId, resourcesForTopic);
  }

  async findById(id: string): Promise<Resource | null> {
    return this.resources.get(id) || null;
  }

  async findByTopicId(topicId: string): Promise<Resource[]> {
    const resourceIds = this.topicResources.get(topicId) || new Set<string>();
    const resources: Resource[] = [];
    
    for (const resourceId of resourceIds) {
      const resource = this.resources.get(resourceId);
      if (resource) {
        resources.push(resource);
      }
    }
    
    return resources;
  }

  async findAll(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async delete(id: string): Promise<void> {
    const resource = this.resources.get(id);
    if (resource) {
      const topicId = resource.getTopicId();
      const resourcesForTopic = this.topicResources.get(topicId);
      if (resourcesForTopic) {
        resourcesForTopic.delete(id);
        if (resourcesForTopic.size === 0) {
          this.topicResources.delete(topicId);
        }
      }
      this.resources.delete(id);
    }
  }

  async exists(id: string): Promise<boolean> {
    return this.resources.has(id);
  }
}