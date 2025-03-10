import { User, UserRole } from '../entities/User';

export class AuthorizationService {
  private static readonly roleHierarchy = {
    [UserRole.ADMIN]: ['create', 'read', 'update', 'delete', 'manage_users'],
    [UserRole.EDITOR]: ['create', 'read', 'update'],
    [UserRole.VIEWER]: ['read']
  };

  static canPerformAction(user: User, action: string): boolean {
    const userRole = user.getRole();
    const allowedActions = this.roleHierarchy[userRole];
    return allowedActions.includes(action);
  }

  static canManageUsers(user: User): boolean {
    return user.getRole() === UserRole.ADMIN;
  }

  static canEditTopic(user: User): boolean {
    return user.hasPermission(UserRole.EDITOR);
  }

  static canViewTopic(user: User): boolean {
    return user.hasPermission(UserRole.VIEWER);
  }

  static canManageResources(user: User): boolean {
    return user.hasPermission(UserRole.EDITOR);
  }
}