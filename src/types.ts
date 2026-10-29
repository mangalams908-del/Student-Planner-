export type TaskStatus = 'Pending' | 'Completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  subject: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: number;
  completedAt?: number | null;
}

export type FilterStatus = 'All' | 'Pending' | 'Completed';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export type AuthMode = 'login' | 'signup' | 'forgot_password';

export type MainViewTab = 'tasks' | 'growth';
