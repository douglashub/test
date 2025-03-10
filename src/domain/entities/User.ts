export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export class User {
  readonly id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(id: string, name: string, email: string, password: string, role: UserRole) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id;
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