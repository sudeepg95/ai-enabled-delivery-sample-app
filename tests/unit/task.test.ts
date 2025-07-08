import { v4 as uuidv4 } from 'uuid';
import { TaskModel } from '../../src/models/task';
import { generateTestTask } from '../fixtures/tasks';

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

describe('Task Model', () => {
  // Mock data
  const userId = uuidv4();
  const taskId = uuidv4();
  const now = new Date();
  const mockTask = {
    id: taskId,
    user_id: userId,
    title: 'Test Task',
    description: 'Test Description',
    is_completed: false,
    due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    created_at: now,
    updated_at: now,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('create', () => {
    it('should create a new task', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([{ insertId: taskId }]);
      
      // Call the method
      const taskData = generateTestTask();
      const result = await TaskModel.create(userId, taskData);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.arrayContaining([
          expect.any(String), // id
          userId,
          taskData.title,
          taskData.description,
          taskData.is_completed,
          taskData.due_date,
        ])
      );
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('user_id', userId);
      expect(result).toHaveProperty('title', taskData.title);
    });

    it('should properly format ISO string dates when creating a task', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([{ insertId: taskId }]);
      
      // Create task data with ISO string date
      const isoDate = '2025-07-08T07:10:14.517Z';
      const taskData = {
        ...generateTestTask(),
        due_date: new Date(isoDate)
      };
      
      // Call the method
      const result = await TaskModel.create(userId, taskData);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      
      // Extract the parameters passed to query
      const queryParams = (pool.query as jest.Mock).mock.calls[0][1];
      
      // The 6th parameter (index 5) should be the formatted date
      const passedDueDate = queryParams[5];
      
      // Verify it's a proper Date object, not a string
      expect(passedDueDate).toBeInstanceOf(Date);
      
      // Verify the result has the correct due_date
      expect(result.due_date).toEqual(taskData.due_date);
    });
  });
  
  describe('findAllByUserId', () => {
    it('should return all tasks for a user', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([[mockTask]]);
      
      // Call the method
      const result = await TaskModel.findAllByUserId(userId);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tasks WHERE user_id ='),
        [userId]
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTask);
    });
    
    it('should return an empty array if no tasks found', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      
      // Call the method
      const result = await TaskModel.findAllByUserId(userId);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(0);
    });
  });
  
  describe('findById', () => {
    it('should return a task by ID', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([[mockTask]]);
      
      // Call the method
      const result = await TaskModel.findById(taskId, userId);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tasks WHERE id = ? AND user_id ='),
        [taskId, userId]
      );
      expect(result).toEqual(mockTask);
    });
    
    it('should return null if task not found', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      
      // Call the method
      const result = await TaskModel.findById(taskId, userId);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });
  
  describe('update', () => {
    it('should update a task', async () => {
      // Mock the database responses
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[mockTask]]) // For findById
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // For update
        .mockResolvedValueOnce([[{ ...mockTask, title: 'Updated Title' }]]); // For findById after update
      
      // Call the method
      const updateData = { title: 'Updated Title' };
      const result = await TaskModel.update(taskId, userId, updateData);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE tasks SET'),
        expect.arrayContaining([
          updateData.title,
          expect.any(Date), // updated_at
          taskId,
          userId,
        ])
      );
      expect(result).toHaveProperty('title', 'Updated Title');
    });

    it('should properly format ISO string dates when updating a task', async () => {
      // Mock the database responses
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[mockTask]]) // For findById
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // For update
        .mockResolvedValueOnce([[{ ...mockTask, due_date: '2025-07-08T07:10:14.517Z' }]]); // For findById after update
      
      // Create update data with ISO string date
      const isoDate = '2025-07-08T07:10:14.517Z';
      const updateData = {
        due_date: new Date(isoDate)
      };
      
      // Call the method
      const result = await TaskModel.update(taskId, userId, updateData);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(3);
      
      // Extract the parameters passed to query for the update
      const queryParams = (pool.query as jest.Mock).mock.calls[1][1];
      
      // The first parameter should be the formatted date (since we're only updating due_date)
      const passedDueDate = queryParams[0];
      
      // Verify it's a proper Date object, not a string
      expect(passedDueDate).toBeInstanceOf(Date);
    });
    
    it('should return null if task not found', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      
      // Call the method
      const updateData = { title: 'Updated Title' };
      const result = await TaskModel.update(taskId, userId, updateData);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });
  
  describe('delete', () => {
    it('should delete a task', async () => {
      // Mock the database responses
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[mockTask]]) // For findById
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // For delete
      
      // Call the method
      const result = await TaskModel.delete(taskId, userId);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('DELETE FROM tasks WHERE id = ? AND user_id ='),
        [taskId, userId]
      );
      expect(result).toBe(true);
    });
    
    it('should return false if task not found', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      
      // Call the method
      const result = await TaskModel.delete(taskId, userId);
      
      // Assertions
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  });
});