export abstract class Entity {
  protected constructor(
    protected readonly id: string,
    protected readonly createdAt: Date,
    protected updatedAt: Date
  ) {}

  getId(): string {
    return this.id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected setUpdatedAt(): void {
    this.updatedAt = new Date();
  }
}