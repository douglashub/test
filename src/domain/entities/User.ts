import { Entity } from './Entity';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export class User extends Entity {
  private constructor(
    id: string,
    private readonly name: string,
    private readonly email: string,
    private role: UserRole,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    name: string,
    email: string,
    role: UserRole = UserRole.VIEWER
  ): User {
    const now = new Date();
    return new User(
      uuidv4(),
      name,
      email,
      role,
      now,
      now
    );
  }

  updateRole(role: UserRole): void {
    this.role = role;
    this.setUpdatedAt();
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getRole(): UserRole {
    return this.role;
  }

  hasPermission(requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.EDITOR]: 2,
      [UserRole.VIEWER]: 1
    };

    return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
  }
}