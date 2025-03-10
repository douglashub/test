import { Entity } from './Entity';
import { v4 as uuidv4 } from 'uuid';

export class Topic extends Entity {
  private readonly version: number;
  private readonly childTopics: Set<string>;

  private constructor(
    id: string,
    private readonly name: string,
    private content: string,
    private readonly parentTopicId: string | null,
    version: number,
    createdAt: Date,
    updatedAt: Date,
    childTopics: Set<string>
  ) {
    super(id, createdAt, updatedAt);
    this.version = version;
    this.childTopics = childTopics;
  }

  static create(
    name: string,
    content: string,
    parentTopicId: string | null = null
  ): Topic {
    const now = new Date();
    return new Topic(
      uuidv4(),
      name,
      content,
      parentTopicId,
      1,
      now,
      now,
      new Set<string>()
    );
  }

  createNewVersion(content: string): Topic {
    return new Topic(
      this.id,
      this.name,
      content,
      this.parentTopicId,
      this.version + 1,
      this.createdAt,
      new Date(),
      new Set(this.childTopics)
    );
  }

  addChildTopic(childTopicId: string): void {
    this.childTopics.add(childTopicId);
    this.setUpdatedAt();
  }

  removeChildTopic(childTopicId: string): void {
    this.childTopics.delete(childTopicId);
    this.setUpdatedAt();
  }

  getName(): string {
    return this.name;
  }

  getContent(): string {
    return this.content;
  }

  getVersion(): number {
    return this.version;
  }

  getParentTopicId(): string | null {
    return this.parentTopicId;
  }

  getChildTopics(): string[] {
    return Array.from(this.childTopics);
  }

  hasChild(topicId: string): boolean {
    return this.childTopics.has(topicId);
  }
}