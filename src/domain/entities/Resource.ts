import { Entity } from './Entity';
import { v4 as uuidv4 } from 'uuid';

export enum ResourceType {
  VIDEO = 'video',
  ARTICLE = 'article',
  PDF = 'pdf'
}

export class Resource extends Entity {
  private constructor(
    id: string,
    private readonly topicId: string,
    private readonly url: string,
    private description: string,
    private readonly type: ResourceType,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    topicId: string,
    url: string,
    description: string,
    type: ResourceType
  ): Resource {
    const now = new Date();
    return new Resource(
      uuidv4(),
      topicId,
      url,
      description,
      type,
      now,
      now
    );
  }

  updateDescription(description: string): void {
    this.description = description;
    this.setUpdatedAt();
  }

  getTopicId(): string {
    return this.topicId;
  }

  getUrl(): string {
    return this.url;
  }

  getDescription(): string {
    return this.description;
  }

  getType(): ResourceType {
    return this.type;
  }
}