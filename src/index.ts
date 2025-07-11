import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import config from './config';
import { testConnection } from './config/database';
import { errorHandler } from './utils/error';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use(authRoutes);
app.use('/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date(),
    environment: config.server.nodeEnv,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.server.port;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start listening
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT} in ${config.server.nodeEnv} mode`);
      // eslint-disable-next-line no-console
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION! Shutting down...');
  // eslint-disable-next-line no-console
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  // eslint-disable-next-line no-console
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  // eslint-disable-next-line no-console
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer();