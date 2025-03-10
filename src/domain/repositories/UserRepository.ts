// src/domain/repositories/UserRepository.ts
import { User } from "../entities/User";

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export default class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async delete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.emailIndex.delete(user.email);
      this.users.delete(id);
    }
  }

  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }
}