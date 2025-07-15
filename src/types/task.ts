
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'date' | 'priority' | 'title';
