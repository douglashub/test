import { User, UserRole } from '../../domain/entities/User';

describe('User', () => {
  describe('constructor', () => {
    it('should create a new user with valid parameters', () => {
      const id = 'user-123';
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'password123';
      const role = UserRole.ADMIN;

      const user = new User(id, name, email, password, role);

      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.password).toBe(password);
      expect(user.role).toBe(role);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getters', () => {
    it('should return correct values from getters', () => {
      const user = new User('user-123', 'Test User', 'test@example.com', 'password123', UserRole.EDITOR);

      expect(user.getId()).toBe('user-123');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getRole()).toBe(UserRole.EDITOR);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has required role', () => {
      const adminUser = new User('admin-123', 'Admin', 'admin@example.com', 'password', UserRole.ADMIN);
      const editorUser = new User('editor-123', 'Editor', 'editor@example.com', 'password', UserRole.EDITOR);
      const viewerUser = new User('viewer-123', 'Viewer', 'viewer@example.com', 'password', UserRole.VIEWER);

      // Admin has all permissions
      expect(adminUser.hasPermission(UserRole.ADMIN)).toBe(true);
      expect(adminUser.hasPermission(UserRole.EDITOR)).toBe(true);
      expect(adminUser.hasPermission(UserRole.VIEWER)).toBe(true);

      // Editor has editor and viewer permissions
      expect(editorUser.hasPermission(UserRole.ADMIN)).toBe(false);
      expect(editorUser.hasPermission(UserRole.EDITOR)).toBe(true);
      expect(editorUser.hasPermission(UserRole.VIEWER)).toBe(true);

      // Viewer has only viewer permissions
      expect(viewerUser.hasPermission(UserRole.ADMIN)).toBe(false);
      expect(viewerUser.hasPermission(UserRole.EDITOR)).toBe(false);
      expect(viewerUser.hasPermission(UserRole.VIEWER)).toBe(true);
    });
  });
});