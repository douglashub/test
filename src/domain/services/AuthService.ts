// src/domain/services/AuthService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

class AuthService {
  private userRepository: UserRepository;
  private readonly JWT_SECRET: string;
  
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    // Use environment variable or fallback for testing
    this.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
  }

  async register(name: string, email: string, password: string, role: UserRole): Promise<{ user: User; token: string } | null> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return null; // Invalid email format
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return null; // User already exists
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User(Date.now().toString(), name, email, hashedPassword, role);
    
    await this.userRepository.save(user);
    
    const token = jwt.sign(
      { userId: user.id, role: user.role, permissions: this.getRolePermissions(user.role) }, 
      this.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    
    const token = jwt.sign(
      { userId: user.id, role: user.role, permissions: this.getRolePermissions(user.role) },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return { user, token };
  }

  private getRolePermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ['create', 'read', 'update', 'delete', 'manage_users'],
      [UserRole.EDITOR]: ['create', 'read', 'update'],
      [UserRole.VIEWER]: ['read']
    };
    
    return permissions[role] || [];
  }
}

export default AuthService;