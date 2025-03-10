import { Resource } from '../entities/Resource';

export interface ResourceRepository {
  save(resource: Resource): Promise<void>;
  findById(id: string): Promise<Resource | null>;
  findByTopicId(topicId: string): Promise<Resource[]>;
  findAll(): Promise<Resource[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}