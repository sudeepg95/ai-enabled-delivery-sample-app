import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the task
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: The UUID of the user who owns this task
 *         title:
 *           type: string
 *           description: The title of the task
 *         description:
 *           type: string
 *           description: The detailed description of the task
 *         is_completed:
 *           type: boolean
 *           description: Whether the task is completed
 *           default: false
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: The due date for the task
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the task was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the task was last updated
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         user_id: 123e4567-e89b-12d3-a456-426614174001
 *         title: Complete project documentation
 *         description: Write comprehensive documentation for the API endpoints
 *         is_completed: false
 *         due_date: 2023-12-31T23:59:59.000Z
 *         created_at: 2023-01-01T00:00:00.000Z
 *         updated_at: 2023-01-01T00:00:00.000Z
 */

// Task interface
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Task creation interface
export interface CreateTaskDTO {
  title: string;
  description?: string;
  is_completed?: boolean;
  due_date?: Date;
}

// Task update interface
export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  is_completed?: boolean;
  due_date?: Date;
}

// Task model class
export class TaskModel {
  /**
   * Create a new task
   * @param userId - ID of the user who owns the task
   * @param taskData - Task data including title, description, etc.
   * @returns The created task
   */
  static async create(userId: string, taskData: CreateTaskDTO): Promise<Task> {
    const { title, description, is_completed, due_date } = taskData;
    
    // Generate UUID
    const id = uuidv4();
    const now = new Date();
    
    // Format due_date properly for MySQL TIMESTAMP
    let formattedDueDate = null;
    if (due_date) {
      // Convert to MySQL compatible format
      formattedDueDate = new Date(due_date);
    }
    
    // Insert task into database
    await pool.query<ResultSetHeader>(
      `INSERT INTO tasks (id, user_id, title, description, is_completed, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title, description || null, is_completed || false, formattedDueDate, now, now]
    );
    
    // Return created task
    return {
      id,
      user_id: userId,
      title,
      description: description || null,
      is_completed: is_completed || false,
      due_date: due_date || null,
      created_at: now,
      updated_at: now,
    };
  }
  
  /**
   * Find all tasks for a specific user
   * @param userId - ID of the user
   * @returns Array of tasks
   */
  static async findAllByUserId(userId: string): Promise<Task[]> {
    const [tasks] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return tasks as Task[];
  }
  
  /**
   * Find a task by ID for a specific user
   * @param id - Task ID
   * @param userId - User ID
   * @returns Task object or null if not found
   */
  static async findById(id: string, userId: string): Promise<Task | null> {
    const [tasks] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (tasks.length === 0) {
      return null;
    }
    
    return tasks[0] as Task;
  }
  
  /**
   * Update a task
   * @param id - Task ID
   * @param userId - User ID
   * @param taskData - Task data to update
   * @returns Updated task or null if not found
   */
  static async update(id: string, userId: string, taskData: UpdateTaskDTO): Promise<Task | null> {
    // Check if task exists and belongs to user
    const task = await this.findById(id, userId);
    
    if (!task) {
      return null;
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (taskData.title !== undefined) {
      updates.push('title = ?');
      values.push(taskData.title);
    }
    
    if (taskData.description !== undefined) {
      updates.push('description = ?');
      values.push(taskData.description);
    }
    
    if (taskData.is_completed !== undefined) {
      updates.push('is_completed = ?');
      values.push(taskData.is_completed);
    }
    
    if (taskData.due_date !== undefined) {
      updates.push('due_date = ?');
      // Format due_date properly for MySQL TIMESTAMP
      const formattedDueDate = taskData.due_date ? new Date(taskData.due_date) : null;
      values.push(formattedDueDate);
    }
    
    // Add updated_at timestamp
    updates.push('updated_at = ?');
    values.push(new Date());
    
    // Add task ID and user ID to values
    values.push(id);
    values.push(userId);
    
    // Execute update query
    await pool.query<ResultSetHeader>(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    // Return updated task
    return this.findById(id, userId);
  }
  
  /**
   * Delete a task
   * @param id - Task ID
   * @param userId - User ID
   * @returns Boolean indicating success
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    // Check if task exists and belongs to user
    const task = await this.findById(id, userId);
    
    if (!task) {
      return false;
    }
    
    // Delete task
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }
}