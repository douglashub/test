import { Topic } from '../entities/Topic';

export interface TopicRepository {
  save(topic: Topic): Promise<void>;
  findById(id: string): Promise<Topic | null>;
  findByIdAndVersion(id: string, version: number): Promise<Topic | null>;
  findAll(): Promise<Topic[]>;
  findByParentId(parentId: string | null): Promise<Topic[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  findAllVersions(id: string): Promise<Topic[]>;
}