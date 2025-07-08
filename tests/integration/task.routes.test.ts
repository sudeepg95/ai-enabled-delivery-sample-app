import supertest from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import taskRoutes from '../../src/routes/task.routes';
import { errorHandler } from '../../src/utils/error';
import { generateUserPayload } from '../fixtures/users';
import { validTask, invalidTasks, generateTestTask, generateUserTasks } from '../fixtures/tasks';

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

// Mock task storage
const tasks: Record<string, any> = {};
let tasksByUserId: Record<string, string[]> = {};

// Setup test app
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  // Mock the authenticate middleware
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com',
  };
  next();
});
app.use('/tasks', taskRoutes);
app.use(errorHandler);

// Setup mock database before tests
beforeAll(() => {
  // Set up the mock implementation for pool.query
  (pool.query as jest.Mock).mockImplementation((sql: string, params: any[] = []) => {
    try {
      // Handle different query types based on the SQL statement
      if (sql.includes('SELECT * FROM tasks WHERE user_id =')) {
        const userId = params[0];
        const userTasks = (tasksByUserId[userId] || []).map(taskId => tasks[taskId]);
        return [userTasks, []];
      }
      else if (sql.includes('SELECT * FROM tasks WHERE id = ? AND user_id =')) {
        const [taskId, userId] = params;
        if (tasks[taskId] && tasks[taskId].user_id === userId) {
          return [[tasks[taskId]], []];
        }
        return [[], []];
      }
      else if (sql.includes('INSERT INTO tasks')) {
        const [id, userId, title, description, is_completed, due_date, created_at, updated_at] = params;
        
        // Convert Date objects to ISO strings for storage
        const due_date_str = due_date instanceof Date ? due_date.toISOString() : due_date;
        const created_at_str = created_at instanceof Date ? created_at.toISOString() : created_at;
        const updated_at_str = updated_at instanceof Date ? updated_at.toISOString() : updated_at;
        
        // Store the task
        tasks[id] = {
          id,
          user_id: userId,
          title,
          description,
          is_completed,
          due_date: due_date_str,
          created_at: created_at_str,
          updated_at: updated_at_str
        };
        
        // Add to user's tasks
        if (!tasksByUserId[userId]) {
          tasksByUserId[userId] = [];
        }
        tasksByUserId[userId].push(id);
        
        return [{ insertId: id }, []];
      }
      else if (sql.includes('UPDATE tasks SET')) {
        const taskId = params[params.length - 2];
        const userId = params[params.length - 1];
        
        // Check if task exists and belongs to user
        if (!tasks[taskId] || tasks[taskId].user_id !== userId) {
          return [{ affectedRows: 0 }, []];
        }
        
        // Update task fields
        let updateIndex = 0;
        if (sql.includes('title = ?')) {
          tasks[taskId].title = params[updateIndex++];
        }
        if (sql.includes('description = ?')) {
          tasks[taskId].description = params[updateIndex++];
        }
        if (sql.includes('is_completed = ?')) {
          tasks[taskId].is_completed = params[updateIndex++];
        }
        if (sql.includes('due_date = ?')) {
          tasks[taskId].due_date = params[updateIndex++];
        }
        if (sql.includes('updated_at = ?')) {
          tasks[taskId].updated_at = params[updateIndex++];
        }
        
        return [{ affectedRows: 1 }, []];
      }
      else if (sql.includes('DELETE FROM tasks')) {
        const [taskId, userId] = params;
        
        // Check if task exists and belongs to user
        if (!tasks[taskId] || tasks[taskId].user_id !== userId) {
          return [{ affectedRows: 0 }, []];
        }
        
        // Remove task
        delete tasks[taskId];
        tasksByUserId[userId] = (tasksByUserId[userId] || []).filter(id => id !== taskId);
        
        return [{ affectedRows: 1 }, []];
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
  Object.keys(tasks).forEach(key => delete tasks[key]);
  tasksByUserId = {};
});

// Helper function to create a test token
const createTestToken = (userId = 'test-user-id') => {
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    String(config.jwt.secret),
    { expiresIn: '1h' }
  );
};

describe('Task Routes', () => {
  describe('POST /tasks', () => {
    it('should create a new task with valid data', async () => {
      const token = createTestToken();
      
      const response = await supertest(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validTask)
        .expect(201);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data.task).toHaveProperty('id');
      expect(response.body.data.task).toHaveProperty('title', validTask.title);
      expect(response.body.data.task).toHaveProperty('description', validTask.description);
      expect(response.body.data.task).toHaveProperty('is_completed', validTask.is_completed);
    });
    
    it('should return 400 if title is missing', async () => {
      const token = createTestToken();
      
      const response = await supertest(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidTasks.missingTitle)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Title is required');
    });
  });
  
  describe('GET /tasks', () => {
    it('should return all tasks for the authenticated user', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      // Create some test tasks
      const testTasks = generateUserTasks(userId, 3);
      testTasks.forEach(task => {
        tasks[task.id] = task;
        if (!tasksByUserId[userId]) {
          tasksByUserId[userId] = [];
        }
        tasksByUserId[userId].push(task.id);
      });
      
      const response = await supertest(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(3);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.tasks[0]).toHaveProperty('id');
      expect(response.body.data.tasks[0]).toHaveProperty('title');
    });
    
    it('should return an empty array if user has no tasks', async () => {
      const userId = 'user-with-no-tasks';
      const token = createTestToken(userId);
      
      const response = await supertest(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(0);
      expect(response.body.data.tasks).toHaveLength(0);
    });
  });
  
  describe('GET /tasks/:id', () => {
    it('should return a specific task by ID', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      // Create a test task
      const testTask = generateUserTasks(userId, 1)[0];
      tasks[testTask.id] = testTask;
      if (!tasksByUserId[userId]) {
        tasksByUserId[userId] = [];
      }
      tasksByUserId[userId].push(testTask.id);
      
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data.task).toHaveProperty('id', testTask.id);
      expect(response.body.data.task).toHaveProperty('title', testTask.title);
    });
    
    it('should return 404 if task does not exist', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      const response = await supertest(app)
        .get(`/tasks/${uuidv4()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Task not found');
    });
    
    it('should return 404 if task belongs to another user', async () => {
      const userId = 'test-user-id';
      const otherUserId = 'other-user-id';
      const token = createTestToken(userId);
      
      // Create a test task for another user
      const testTask = generateUserTasks(otherUserId, 1)[0];
      tasks[testTask.id] = testTask;
      if (!tasksByUserId[otherUserId]) {
        tasksByUserId[otherUserId] = [];
      }
      tasksByUserId[otherUserId].push(testTask.id);
      
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Task not found');
    });
  });
  
  describe('PUT /tasks/:id', () => {
    it('should handle ISO string dates correctly when updating tasks', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      // Create a test task
      const testTask = generateUserTasks(userId, 1)[0];
      tasks[testTask.id] = testTask;
      if (!tasksByUserId[userId]) {
        tasksByUserId[userId] = [];
      }
      tasksByUserId[userId].push(testTask.id);
      
      // Update with an ISO string date
      const isoDate = '2025-07-08T07:10:14.517Z';
      const updateData = {
        due_date: new Date(isoDate)
      };
      
      const response = await supertest(app)
        .put(`/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data.task).toHaveProperty('id', testTask.id);
      
      // The date might be formatted differently in the response, but should represent the same time
      const returnedDate = new Date(response.body.data.task.due_date);
      const originalDate = new Date(isoDate);
      expect(returnedDate.getTime()).toBeCloseTo(originalDate.getTime(), -3); // Allow small difference due to precision
    });

    it('should update a task with valid data', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      // Create a test task
      const testTask = generateUserTasks(userId, 1)[0];
      tasks[testTask.id] = testTask;
      if (!tasksByUserId[userId]) {
        tasksByUserId[userId] = [];
      }
      tasksByUserId[userId].push(testTask.id);
      
      const updateData = {
        title: 'Updated Task Title',
        is_completed: true,
      };
      
      const response = await supertest(app)
        .put(`/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data.task).toHaveProperty('id', testTask.id);
      expect(response.body.data.task).toHaveProperty('title', updateData.title);
      expect(response.body.data.task).toHaveProperty('is_completed', updateData.is_completed);
    });
    
    it('should return 404 if task does not exist', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      const updateData = {
        title: 'Updated Task Title',
      };
      
      const response = await supertest(app)
        .put(`/tasks/${uuidv4()}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Task not found');
    });
  });
  
  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      // Create a test task
      const testTask = generateUserTasks(userId, 1)[0];
      tasks[testTask.id] = testTask;
      if (!tasksByUserId[userId]) {
        tasksByUserId[userId] = [];
      }
      tasksByUserId[userId].push(testTask.id);
      
      const response = await supertest(app)
        .delete(`/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
      
      // Verify task was deleted
      expect(tasks[testTask.id]).toBeUndefined();
      expect(tasksByUserId[userId]).not.toContain(testTask.id);
    });
    
    it('should return 404 if task does not exist', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      const response = await supertest(app)
        .delete(`/tasks/${uuidv4()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Task not found');
    });
  });
  
  describe('Complete Task Journey', () => {
    it('should handle ISO string dates correctly when creating tasks', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      // Create a task with an ISO string date format
      const isoDate = '2025-07-08T07:10:14.517Z';
      const newTask = {
        ...generateTestTask(),
        due_date: new Date(isoDate)
      };
      
      const createResponse = await supertest(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(newTask)
        .expect(201);
      
      expect(createResponse.body.status).toBe('success');
      expect(createResponse.body.data.task).toHaveProperty('title', newTask.title);
      
      // Verify the task was created with the correct date
      const taskId = createResponse.body.data.task.id;
      
      const getResponse = await supertest(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(getResponse.body.status).toBe('success');
      expect(getResponse.body.data.task).toHaveProperty('id', taskId);
      
      // The date might be formatted differently in the response, but should represent the same time
      const returnedDate = new Date(getResponse.body.data.task.due_date);
      const originalDate = new Date(isoDate);
      expect(returnedDate.getTime()).toBeCloseTo(originalDate.getTime(), -3); // Allow small difference due to precision
    });

    it('should allow creating, retrieving, updating, and deleting a task', async () => {
      const userId = 'test-user-id';
      const token = createTestToken(userId);
      
      // Step 1: Create a new task
      const newTask = generateTestTask();
      const createResponse = await supertest(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(newTask)
        .expect(201);
      
      expect(createResponse.body.status).toBe('success');
      expect(createResponse.body.data.task).toHaveProperty('title', newTask.title);
      
      const taskId = createResponse.body.data.task.id;
      
      // Step 2: Retrieve the task
      const getResponse = await supertest(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(getResponse.body.status).toBe('success');
      expect(getResponse.body.data.task).toHaveProperty('id', taskId);
      expect(getResponse.body.data.task).toHaveProperty('title', newTask.title);
      
      // Step 3: Update the task
      const updateData = {
        title: 'Updated Task Title',
        is_completed: true,
      };
      
      const updateResponse = await supertest(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(updateResponse.body.status).toBe('success');
      expect(updateResponse.body.data.task).toHaveProperty('title', updateData.title);
      expect(updateResponse.body.data.task).toHaveProperty('is_completed', updateData.is_completed);
      
      // Step 4: Delete the task
      await supertest(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
      
      // Step 5: Verify task was deleted
      const verifyResponse = await supertest(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(verifyResponse.body.status).toBe('error');
      expect(verifyResponse.body.message).toContain('Task not found');
    });
  });
});