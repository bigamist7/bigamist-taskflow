
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  priority: 'baixa' | 'media' | 'alta';
  category?: string;
  dueDate?: Date;
  status: 'por-fazer' | 'concluida';
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'date' | 'priority' | 'title';
export type TaskStatus = 'por-fazer' | 'concluida';
export type TaskPriority = 'baixa' | 'media' | 'alta';
