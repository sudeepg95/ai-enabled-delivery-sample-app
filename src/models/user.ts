import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { hashPassword } from '../utils/password';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password_hash:
 *           type: string
 *           description: The hashed password
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was last updated
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         email: user@example.com
 *         created_at: 2023-01-01T00:00:00.000Z
 *         updated_at: 2023-01-01T00:00:00.000Z
 */

// User interface
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

// User creation interface
export interface CreateUserInput {
  email: string;
  password: string;
}

// User login interface
export interface LoginUserInput {
  email: string;
  password: string;
}

// User model class
export class UserModel {
  /**
   * Create a new user
   * @param userData - User data including email and password
   * @returns The created user without password
   */
  static async create(userData: CreateUserInput): Promise<Omit<User, 'password_hash'>> {
    const { email, password } = userData;
    
    // Check if user with email already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const password_hash = await hashPassword(password);
    
    // Generate UUID
    const id = uuidv4();
    const now = new Date();
    
    // Insert user into database
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, email, password_hash, now, now]
    );
    
    // Return user without password
    return {
      id,
      email,
      created_at: now,
      updated_at: now,
    };
  }
  
  /**
   * Find a user by email
   * @param email - User's email
   * @returns User object or null if not found
   */
  static async findByEmail(email: string): Promise<User | null> {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0] as User;
  }
  
  /**
   * Find a user by ID
   * @param id - User's UUID
   * @returns User object or null if not found
   */
  static async findById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0] as Omit<User, 'password_hash'>;
  }
}