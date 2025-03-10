import { Topic } from '../../domain/entities/Topic';
import { TopicRepository } from '../../domain/repositories/TopicRepository';

export class InMemoryTopicRepository implements TopicRepository {
  private topics: Map<string, Topic[]>;

  constructor() {
    this.topics = new Map<string, Topic[]>();
  }

  async save(topic: Topic): Promise<void> {
    const existingVersions = this.topics.get(topic.getId()) || [];
    existingVersions.push(topic);
    this.topics.set(topic.getId(), existingVersions);
  }

  async findById(id: string): Promise<Topic | null> {
    const versions = this.topics.get(id);
    if (!versions || versions.length === 0) {
      return null;
    }
    return versions[versions.length - 1];
  }

  async findByIdAndVersion(id: string, version: number): Promise<Topic | null> {
    const versions = this.topics.get(id);
    if (!versions) {
      return null;
    }
    return versions.find(topic => topic.getVersion() === version) || null;
  }

  async findAll(): Promise<Topic[]> {
    const allTopics: Topic[] = [];
    for (const versions of this.topics.values()) {
      if (versions.length > 0) {
        allTopics.push(versions[versions.length - 1]);
      }
    }
    return allTopics;
  }

  async findByParentId(parentId: string | null): Promise<Topic[]> {
    const allTopics = await this.findAll();
    return allTopics.filter(topic => topic.getParentTopicId() === parentId);
  }

  async delete(id: string): Promise<void> {
    this.topics.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.topics.has(id);
  }

  async findAllVersions(id: string): Promise<Topic[]> {
    return this.topics.get(id) || [];
  }
}