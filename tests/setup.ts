import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../src/utils/password';

// Mock user storage
const users: Record<string, any> = {};
let userIdByEmail: Record<string, string> = {};

// Mock the database module
jest.mock('../src/config/database', () => {
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
import { pool } from '../src/config/database';

// Initialize before all tests
beforeAll(() => {
  setupMockDatabase();
});

// Clear mock data before each test
beforeEach(() => {
  clearMockData();
});

// Set up the mock implementation
export const setupMockDatabase = (): void => {
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
};

// Clear all mock data
export const clearMockData = (): void => {
  Object.keys(users).forEach(key => delete users[key]);
  userIdByEmail = {};
};

// Create a test user
export const createTestUser = async (
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