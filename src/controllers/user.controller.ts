// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import AuthService from '../domain/services/AuthService';
import InMemoryUserRepository from '../domain/repositories/UserRepository';

const userRepository = new InMemoryUserRepository();
const authService = new AuthService(userRepository);

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  
  try {
    const result = await authService.register(name, email, password, role);
    
    if (!result) {
      return res.status(400).json({ error: 'Invalid input or user already exists' });
    }
    
    const { user, token } = result;
    res.status(201).json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const result = await authService.login(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { user, token } = result;
    res.status(200).json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (req.body.role) {
      user.role = req.body.role;
    }
    
    await userRepository.save(user);
    
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const exists = await userRepository.exists(req.params.id);
    
    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await userRepository.delete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};