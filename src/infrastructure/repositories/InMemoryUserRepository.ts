import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User>;
  private emailIndex: Map<string, string>;

  constructor() {
    this.users = new Map<string, User>();
    this.emailIndex = new Map<string, string>();
  }

  async save(user: User): Promise<void> {
    this.users.set(user.getId(), user);
    this.emailIndex.set(user.getEmail(), user.getId());
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) {
      return null;
    }
    return this.users.get(userId) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async delete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.emailIndex.delete(user.getEmail());
      this.users.delete(id);
    }
  }

  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }
}