import { v4 as uuidv4 } from 'uuid';

// Valid user data for testing
export const validUser = {
  email: 'test@example.com',
  password: 'password123',
};

// Invalid user data for testing
export const invalidUsers = {
  missingEmail: {
    password: 'password123',
  },
  missingPassword: {
    email: 'test@example.com',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'password123',
  },
  shortPassword: {
    email: 'test@example.com',
    password: 'short',
  },
};

// Generate a test user with a unique email
export const generateTestUser = (emailPrefix = 'user') => {
  const uniqueId = uuidv4().substring(0, 8);
  return {
    email: `${emailPrefix}-${uniqueId}@example.com`,
    password: 'password123',
  };
};

// Generate a JWT payload for testing
export const generateUserPayload = () => {
  return {
    id: uuidv4(),
    email: `user-${uuidv4().substring(0, 8)}@example.com`,
  };
};