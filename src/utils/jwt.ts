import jwt from 'jsonwebtoken';
import config from '../config';
import { ApiError, HttpStatus } from './error';

// User interface for JWT payload
export interface UserPayload {
  id: string;
  email: string;
}

/**
 * Generate JWT token
 * @param user User payload to include in token
 * @returns Signed JWT token
 */
export const generateToken = (user: UserPayload): string => {
  const payload = { id: user.id, email: user.email };
  // Use a simple string as the secret
  const secret = String(config.jwt.secret);
  // Use a string for expiresIn
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

/**
 * Verify JWT token
 * @param token JWT token to verify
 * @returns Decoded user payload
 * @throws ApiError if token is invalid
 */
export const verifyToken = async (token: string): Promise<UserPayload> => {
  try {
    // Use a simple promise wrapper around jwt.verify
    return await new Promise<UserPayload>((resolve, reject) => {
      jwt.verify(token, String(config.jwt.secret), (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          // Cast the decoded token to UserPayload
          resolve(decoded as UserPayload);
        }
      });
    });
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token');
    } else {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication failed');
    }
  }
};