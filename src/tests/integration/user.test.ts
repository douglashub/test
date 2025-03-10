import request from 'supertest';
import { app } from '../../index'; // Path to your server entry point
import { UserRole } from '../../domain/entities/User';

// Create an actual value-based enum for use in tests
enum UserRoleValue {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

describe('User Authentication and CRUD Operations', () => {
  let adminToken: string;
  let viewerToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    // Create admin user for testing
    const adminRes = await request(app)
      .post('/api/users/register')
      .send({ name: 'Admin User', email: 'admin@test.com', password: 'password', role: UserRoleValue.ADMIN });
    expect(adminRes.statusCode).toEqual(201);
    adminToken = adminRes.body.token;

    // Create viewer user for testing
    const viewerRes = await request(app)
      .post('/api/users/register')
      .send({ name: 'Viewer User', email: 'viewer@test.com', password: 'password', role: UserRoleValue.VIEWER });
    expect(viewerRes.statusCode).toEqual(201);
    viewerToken = viewerRes.body.token;
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Test User', email: 'test@test.com', password: 'password', role: UserRoleValue.VIEWER }); // Ensure role is passed
      createdUserId = res.body.user.id;
      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Test User', email: 'invalid-email', password: 'password', role: UserRoleValue.VIEWER });
      expect(res.statusCode).toEqual(400);  // Expecting a 400 for invalid email format
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@test.com', password: 'password' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@test.com', password: 'wrong-password' });
      expect(res.statusCode).toEqual(401); // Unauthorized
    });
  });

  describe('User CRUD Operations', () => {
    it('should get user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);  // Expecting OK status code for valid user retrieval
      expect(res.body).toHaveProperty('id');
    });

    it('should update user role (admin only)', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRoleValue.EDITOR });
      expect(res.statusCode).toEqual(200); // Expecting 200 for successful role update by admin
    });

    it('should prevent non-admins from updating roles', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ role: UserRoleValue.EDITOR });
      expect(res.statusCode).toEqual(403); // Expecting 403 for non-admins trying to update role
    });

    it('should delete user', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200); // Expecting 200 for successful user deletion by admin
    });
  });
});
