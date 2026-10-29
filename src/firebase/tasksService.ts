import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from './config';
import { Task, TaskStatus } from '../types';

// In-memory listener registry for local mode so tabs and components update reactively
type TasksListener = (tasks: Task[]) => void;
const activeListeners: Map<string, Set<TasksListener>> = new Map();

const notifyLocalListeners = (userId: string, tasks: Task[]) => {
  const set = activeListeners.get(userId);
  if (set) {
    set.forEach((listener) => {
      try {
        listener(tasks);
      } catch (e) {
        console.error('Error invoking local task subscriber:', e);
      }
    });
  }
};

const getLocalTasks = (userId: string): Task[] => {
  const localKey = `student_planner_user_tasks_${userId}`;
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const parsed: Task[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.createdAt - a.createdAt);
      }
    }
  } catch (err) {
    console.error('Error reading local tasks:', err);
  }
  return [];
};

export const subscribeUserTasks = (
  userId: string,
  onTasksUpdate: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  if (isFirebaseConfigured && db) {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId,
            title: data.title,
            subject: data.subject,
            status: data.status as TaskStatus,
            dueDate: data.dueDate,
            createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            completedAt: typeof data.completedAt === 'number' ? data.completedAt : null,
          };
        });
        tasks.sort((a, b) => b.createdAt - a.createdAt);
        onTasksUpdate(tasks);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      }
    );
  }

  // Fallback: Local reactive storage per user account
  const localKey = `student_planner_user_tasks_${userId}`;

  // 1. Initial emission
  const initialTasks = getLocalTasks(userId);
  onTasksUpdate(initialTasks);

  // 2. Register in activeListeners set
  if (!activeListeners.has(userId)) {
    activeListeners.set(userId, new Set());
  }
  activeListeners.get(userId)!.add(onTasksUpdate);

  // 3. Listen for changes from other tabs/windows
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === localKey) {
      onTasksUpdate(getLocalTasks(userId));
    }
  };
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    const set = activeListeners.get(userId);
    if (set) {
      set.delete(onTasksUpdate);
      if (set.size === 0) {
        activeListeners.delete(userId);
      }
    }
  };
};

export const createTask = async (
  userId: string,
  taskData: {
    title: string;
    subject: string;
    status: TaskStatus;
    dueDate?: string;
  }
): Promise<Task> => {
  const now = Date.now();
  const taskId = `task_${now}_${Math.random().toString(36).substring(2, 8)}`;

  const newTask: Task = {
    id: taskId,
    userId,
    title: taskData.title,
    subject: taskData.subject,
    status: taskData.status,
    dueDate: taskData.dueDate || undefined,
    createdAt: now,
    completedAt: taskData.status === 'Completed' ? now : null,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'tasks', taskId);
      const payload: Record<string, any> = {
        userId,
        title: newTask.title,
        subject: newTask.subject,
        status: newTask.status,
        createdAt: newTask.createdAt,
      };
      if (newTask.dueDate) payload.dueDate = newTask.dueDate;
      if (newTask.completedAt) payload.completedAt = newTask.completedAt;

      await setDoc(docRef, payload);
      return newTask;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tasks/${taskId}`);
    }
  }

  // Fallback local persistence
  const localKey = `student_planner_user_tasks_${userId}`;
  const existing = getLocalTasks(userId);
  const updated = [newTask, ...existing];
  try {
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save task to localStorage:', err);
  }
  notifyLocalListeners(userId, updated);
  return newTask;
};

export const updateTask = async (
  userId: string,
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'subject' | 'status' | 'dueDate' | 'completedAt'>>
): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'tasks', taskId);
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.subject !== undefined) payload.subject = updates.subject;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate || '';
      if (updates.completedAt !== undefined) payload.completedAt = updates.completedAt;

      await updateDoc(docRef, payload);
      return;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    }
  }

  // Fallback local persistence
  const localKey = `student_planner_user_tasks_${userId}`;
  try {
    const list = getLocalTasks(userId);
    const updatedList = list.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    localStorage.setItem(localKey, JSON.stringify(updatedList));
    notifyLocalListeners(userId, updatedList);
  } catch (err) {
    console.error('Failed to update local task:', err);
  }
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'tasks', taskId);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    }
  }

  // Fallback local persistence
  const localKey = `student_planner_user_tasks_${userId}`;
  try {
    const list = getLocalTasks(userId);
    const filtered = list.filter((t) => t.id !== taskId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
    notifyLocalListeners(userId, filtered);
  } catch (err) {
    console.error('Failed to delete local task:', err);
  }
};

export const getLocalTaskCount = (userId: string): number => {
  return getLocalTasks(userId).length;
};

export const migrateLocalTasksToFirestore = async (userId: string): Promise<number> => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not yet configured.');
  }

  const localTasks = getLocalTasks(userId);
  if (localTasks.length === 0) return 0;

  let count = 0;
  for (const task of localTasks) {
    try {
      const docRef = doc(db, 'tasks', task.id);
      const payload: Record<string, any> = {
        userId,
        title: task.title,
        subject: task.subject,
        status: task.status,
        createdAt: task.createdAt,
      };
      if (task.dueDate) payload.dueDate = task.dueDate;
      if (task.completedAt) payload.completedAt = task.completedAt;

      await setDoc(docRef, payload, { merge: true });
      count++;
    } catch (err) {
      console.error('Error migrating task to Firestore:', task.id, err);
    }
  }

  // Mark local store as migrated
  localStorage.setItem(`student_planner_migrated_${userId}`, 'true');
  return count;
};

