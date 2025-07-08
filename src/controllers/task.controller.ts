import { Request, Response, NextFunction } from 'express';
import { TaskModel, CreateTaskDTO, UpdateTaskDTO } from '../models/task';
import { ApiError, HttpStatus } from '../utils/error';

/**
 * Create a new task
 * @route POST /tasks
 */
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from authenticated user
    if (!req.user || !req.user.id) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Not authenticated'
      );
    }
    
    const userId = req.user.id;
    const taskData: CreateTaskDTO = req.body;
    
    // Validate required fields
    if (!taskData.title) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Title is required'
      );
    }
    
    // Create task
    const task = await TaskModel.create(userId, taskData);
    
    res.status(HttpStatus.CREATED).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks for the authenticated user
 * @route GET /tasks
 */
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from authenticated user
    if (!req.user || !req.user.id) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Not authenticated'
      );
    }
    
    const userId = req.user.id;
    
    // Get all tasks for user
    const tasks = await TaskModel.findAllByUserId(userId);
    
    res.status(HttpStatus.OK).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific task by ID
 * @route GET /tasks/:id
 */
export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from authenticated user
    if (!req.user || !req.user.id) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Not authenticated'
      );
    }
    
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Validate task ID
    if (!taskId) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Task ID is required'
      );
    }
    
    // Get task
    const task = await TaskModel.findById(taskId, userId);
    
    // Check if task exists
    if (!task) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Task not found'
      );
    }
    
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 * @route PUT /tasks/:id
 */
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from authenticated user
    if (!req.user || !req.user.id) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Not authenticated'
      );
    }
    
    const userId = req.user.id;
    const taskId = req.params.id;
    const taskData: UpdateTaskDTO = req.body;
    
    // Validate task ID
    if (!taskId) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Task ID is required'
      );
    }
    
    // Update task
    const updatedTask = await TaskModel.update(taskId, userId, taskData);
    
    // Check if task exists
    if (!updatedTask) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Task not found'
      );
    }
    
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        task: updatedTask,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * @route DELETE /tasks/:id
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from authenticated user
    if (!req.user || !req.user.id) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Not authenticated'
      );
    }
    
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Validate task ID
    if (!taskId) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Task ID is required'
      );
    }
    
    // Delete task
    const deleted = await TaskModel.delete(taskId, userId);
    
    // Check if task exists
    if (!deleted) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'Task not found'
      );
    }
    
    // Return no content
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};