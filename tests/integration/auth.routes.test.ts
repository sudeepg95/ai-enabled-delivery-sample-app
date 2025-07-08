import supertest from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import authRoutes from '../../src/routes/auth.routes';
import { errorHandler } from '../../src/utils/error';
import { hashPassword } from '../../src/utils/password';
import { validUser, invalidUsers, generateTestUser } from '../fixtures/users';

// Mock the database module
jest.mock('../../src/config/database', () => {
  // Create the mock implementation
  const mockPool = {
    query: jest.fn(),
    getConnection: jest.fn().mockResolvedValue({
      release: jest.fn(),
    }),
  };
  
  return {
    pool: mockPool,
    testConnection: jest.fn().mockResolvedValue(undefined),
  };
});

// Import the mocked database
import { pool } from '../../src/config/database';

// Mock user storage
const users: Record<string, any> = {};
let userIdByEmail: Record<string, string> = {};

// Create a test user
const createTestUser = async (
  email: string = 'test@example.com',
  password: string = 'password123'
): Promise<{ id: string; email: string; password: string }> => {
  const id = uuidv4();
  const password_hash = await hashPassword(password);
  const now = new Date().toISOString();
  
  // Store the user directly in our mock storage
  users[id] = {
    id,
    email,
    password_hash,
    created_at: now,
    updated_at: now
  };
  userIdByEmail[email] = id;
  
  return { id, email, password };
};

// Setup test app
const app = express();
app.use(express.json());
app.use(authRoutes);
app.use(errorHandler);

// Setup mock database before tests
beforeAll(() => {
  // Set up the mock implementation for pool.query
  (pool.query as jest.Mock).mockImplementation((sql: string, params: any[] = []) => {
    try {
      // Handle different query types based on the SQL statement
      if (sql.includes('SELECT * FROM users WHERE email =')) {
        const email = params[0];
        const userId = userIdByEmail[email];
        if (userId) {
          return [[users[userId]], []];
        }
        return [[], []];
      }
      else if (sql.includes('SELECT id, email, created_at, updated_at FROM users WHERE id =')) {
        const id = params[0];
        if (users[id]) {
          // Create a copy without the password_hash
          const { id: userId, email, created_at, updated_at } = users[id];
          return [[{ id: userId, email, created_at, updated_at }], []];
        }
        return [[], []];
      }
      else if (sql.includes('INSERT INTO users')) {
        const [id, email, password_hash, created_at, updated_at] = params;
        
        // Check if email already exists
        if (userIdByEmail[email]) {
          throw new Error('User with this email already exists');
        }
        
        // Store the user
        users[id] = { id, email, password_hash, created_at, updated_at };
        userIdByEmail[email] = id;
        
        return [{ insertId: id }, []];
      }
      
      // Default response for unhandled queries
      return [[], []];
    } catch (error) {
      console.error('Mock database error:', error);
      throw error;
    }
  });
});

// Clear mock data before each test
beforeEach(() => {
  Object.keys(users).forEach(key => delete users[key]);
  userIdByEmail = {};
});

describe('Authentication Routes', () => {

  describe('POST /register', () => {
    it('should register a new user with valid data', async () => {
      const response = await supertest(app)
        .post('/register')
        .send(validUser)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', validUser.email);
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 409 if email already exists', async () => {
      // Create a user first
      await createTestUser(validUser.email, validUser.password);

      // Try to register with the same email
      const response = await supertest(app)
        .post('/register')
        .send(validUser)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Email already in use');
    });

    it('should return 400 if email is invalid', async () => {
      const response = await supertest(app)
        .post('/register')
        .send(invalidUsers.invalidEmail)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid email format');
    });

    it('should return 400 if password is too short', async () => {
      const response = await supertest(app)
        .post('/register')
        .send(invalidUsers.shortPassword)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Password must be at least 8 characters');
    });

    it('should return 400 if email is missing', async () => {
      const response = await supertest(app)
        .post('/register')
        .send(invalidUsers.missingEmail)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await supertest(app)
        .post('/register')
        .send(invalidUsers.missingPassword)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Email and password are required');
    });
  });

  describe('POST /login', () => {
    it('should login a user with valid credentials', async () => {
      // Create a test user
      const { email, password } = await createTestUser();

      // Login with valid credentials
      const response = await supertest(app)
        .post('/login')
        .send({ email, password })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', email);
      expect(response.body.data.user).not.toHaveProperty('password_hash');

      // Verify the token is valid
      const decoded = jwt.verify(response.body.data.token, String(config.jwt.secret));
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', email);
    });

    it('should return 401 if email does not exist', async () => {
      const response = await supertest(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 401 if password is incorrect', async () => {
      // Create a test user
      const { email } = await createTestUser();

      // Login with wrong password
      const response = await supertest(app)
        .post('/login')
        .send({
          email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 400 if email is missing', async () => {
      const response = await supertest(app)
        .post('/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await supertest(app)
        .post('/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Email and password are required');
    });
  });

  describe('GET /me', () => {
    it('should return user data with valid token', async () => {
      // Create a test user
      const { id, email } = await createTestUser();

      // Generate a token
      const token = jwt.sign({ id, email }, String(config.jwt.secret), {
        expiresIn: '1h',
      });

      // Get user profile with token
      const response = await supertest(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id', id);
      expect(response.body.data.user).toHaveProperty('email', email);
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 401 if token is missing', async () => {
      const response = await supertest(app)
        .get('/me')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Authentication required');
    });

    it('should return 401 if token is invalid', async () => {
      const response = await supertest(app)
        .get('/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid token');
    });

    it('should return 401 if token is expired', async () => {
      // Create a test user
      const { id, email } = await createTestUser();

      // Generate an expired token
      const token = jwt.sign({ id, email }, String(config.jwt.secret), {
        expiresIn: '0s',
      });

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get user profile with expired token
      const response = await supertest(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Token expired');
    });

    it('should return 404 if user does not exist', async () => {
      // Generate a token with a non-existent user ID
      const token = jwt.sign(
        { id: uuidv4(), email: 'nonexistent@example.com' },
        String(config.jwt.secret),
        { expiresIn: '1h' }
      );

      // Get user profile with token for non-existent user
      const response = await supertest(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('User not found');
    });
  });

  describe('Complete User Journey', () => {
    it('should allow registration, login, and profile access', async () => {
      // Generate a unique test user
      const testUser = generateTestUser();

      // Step 1: Register a new user
      const registerResponse = await supertest(app)
        .post('/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body.status).toBe('success');
      expect(registerResponse.body.data.user).toHaveProperty('email', testUser.email);

      // Step 2: Login with the new user
      const loginResponse = await supertest(app)
        .post('/login')
        .send(testUser)
        .expect(200);

      expect(loginResponse.body.status).toBe('success');
      expect(loginResponse.body.data).toHaveProperty('token');
      expect(loginResponse.body.data.user).toHaveProperty('email', testUser.email);

      const token = loginResponse.body.data.token;

      // Step 3: Access the protected profile route
      const profileResponse = await supertest(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.status).toBe('success');
      expect(profileResponse.body.data.user).toHaveProperty('email', testUser.email);
    });
  });
});