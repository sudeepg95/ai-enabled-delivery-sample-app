import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'user_tasks_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key_for_dev_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

// Validate required environment variables in production
if (config.server.nodeEnv === 'production') {
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is required in production mode`);
    }
  }
}

export default config;