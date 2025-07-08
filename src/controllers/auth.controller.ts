import { Request, Response, NextFunction } from 'express';
import { UserModel, CreateUserInput, LoginUserInput } from '../models/user';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ApiError, HttpStatus } from '../utils/error';

/**
 * Register a new user
 * @route POST /register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: CreateUserInput = req.body;
    
    // Validate input
    if (!userData.email || !userData.password) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Email and password are required'
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Invalid email format'
      );
    }
    
    // Validate password strength
    if (userData.password.length < 8) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Password must be at least 8 characters long'
      );
    }
    
    // Create user
    const user = await UserModel.create(userData);
    
    res.status(HttpStatus.CREATED).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error instanceof Error && error.message.includes('already exists')) {
      next(new ApiError(HttpStatus.CONFLICT, 'Email already in use'));
    } else {
      next(error);
    }
  }
};

/**
 * Login user
 * @route POST /login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loginData: LoginUserInput = req.body;
    
    // Validate input
    if (!loginData.email || !loginData.password) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Email and password are required'
      );
    }
    
    // Find user by email
    const user = await UserModel.findByEmail(loginData.email);
    
    // Check if user exists
    if (!user) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Invalid email or password'
      );
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password_hash
    );
    
    if (!isPasswordValid) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Invalid email or password'
      );
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });
    
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * @route GET /me
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User is attached to request by auth middleware
    if (!req.user || !req.user.id) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Not authenticated'
      );
    }
    
    // Get user details from database
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'User not found'
      );
    }
    
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};