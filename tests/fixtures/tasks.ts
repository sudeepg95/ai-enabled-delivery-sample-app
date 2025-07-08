import { v4 as uuidv4 } from 'uuid';

// Valid task data for testing
export const validTask = {
  title: 'Test Task',
  description: 'This is a test task',
  is_completed: false,
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
};

// Invalid task data for testing
export const invalidTasks = {
  missingTitle: {
    description: 'This is a test task',
    is_completed: false,
  },
  emptyTitle: {
    title: '',
    description: 'This is a test task',
    is_completed: false,
  },
};

// Generate a test task with unique title
export const generateTestTask = (titlePrefix = 'Task') => {
  const uniqueId = uuidv4().substring(0, 8);
  return {
    title: `${titlePrefix}-${uniqueId}`,
    description: `Description for ${titlePrefix}-${uniqueId}`,
    is_completed: false,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  };
};

// Generate a complete task object (as it would be stored in the database)
export const generateCompleteTask = (userId: string) => {
  const id = uuidv4();
  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  return {
    id,
    user_id: userId,
    title: `Task-${id.substring(0, 8)}`,
    description: `Description for Task-${id.substring(0, 8)}`,
    is_completed: false,
    due_date: dueDate.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
};

// Generate multiple test tasks for a user
export const generateUserTasks = (userId: string, count = 3) => {
  return Array.from({ length: count }, () => generateCompleteTask(userId));
};