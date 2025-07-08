import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, verifyToken } from '../utils/jwt';
import config from '../config';

// Mock the database pool
jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
  testConnection: jest.fn(),
}));

describe('Authentication Utilities', () => {
  describe('Password Utils', () => {
    it('should hash a password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      // Check that the hash is a bcrypt hash
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
      
      // Verify that the original password matches the hash
      const isMatch = await bcrypt.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });
    
    it('should correctly compare passwords', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Test valid password
      const isValidMatch = await comparePassword(password, hashedPassword);
      expect(isValidMatch).toBe(true);
      
      // Test invalid password
      const isInvalidMatch = await comparePassword('wrongPassword', hashedPassword);
      expect(isInvalidMatch).toBe(false);
    });
  });
  
  describe('JWT Utils', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: uuidv4(),
        email: 'test@example.com',
      };
      
      const token = generateToken(user);
      
      // Check that the token is a string
      expect(typeof token).toBe('string');
      
      // Verify the token
      const decoded = jwt.verify(token, String(config.jwt.secret));
      expect(decoded).toHaveProperty('id', user.id);
      expect(decoded).toHaveProperty('email', user.email);
    });
    
    it('should verify a valid token', async () => {
      const user = {
        id: uuidv4(),
        email: 'test@example.com',
      };
      
      // Generate a token
      const token = jwt.sign(user, String(config.jwt.secret), {
        expiresIn: '1h',
      });
      
      // Verify the token
      const decoded = await verifyToken(token);
      expect(decoded).toHaveProperty('id', user.id);
      expect(decoded).toHaveProperty('email', user.email);
    });
    
    it('should reject an invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      
      // Verify the token should throw an error
      await expect(verifyToken(invalidToken)).rejects.toThrow();
    });
  });
});