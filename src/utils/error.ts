// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// HTTP status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error handler middleware
import { Request, Response, NextFunction } from 'express';

export interface ApiErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  stack?: string;
}

export const errorHandler = (
  err: Error & { statusCode?: number },
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';
  
  // Log error (intentionally using console.error for server-side error logging)
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${statusCode} - ${message}`);
  if (err.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};