/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, FilterStatus, MainViewTab } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { TaskFilter } from './components/TaskFilter';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { EmptyState } from './components/EmptyState';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GrowthDashboard } from './components/GrowthDashboard';
import { FirebaseSetupGuide } from './components/FirebaseSetupGuide';
import {
  subscribeUserTasks,
  createTask,
  updateTask,
  deleteTask,
  getLocalTaskCount,
  migrateLocalTasksToFirestore,
} from './firebase/tasksService';
import { Plus, Check, Loader2, CloudUpload } from 'lucide-react';

function PlannerApp() {
  const { currentUser, loading: authLoading, isFirebaseLive } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<MainViewTab>('tasks');
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [localTaskCount, setLocalTaskCount] = useState<number>(0);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);

  // Subscribe to authenticated user's tasks
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setTasksLoading(false);
      setLocalTaskCount(0);
      return;
    }

    // Check if there are local tasks that can be migrated once cloud is connected
    if (isFirebaseLive) {
      const isAlreadyMigrated = localStorage.getItem(`student_planner_migrated_${currentUser.uid}`) === 'true';
      if (!isAlreadyMigrated) {
        setLocalTaskCount(getLocalTaskCount(currentUser.uid));
      }
    }

    setTasksLoading(true);
    const unsubscribe = subscribeUserTasks(
      currentUser.uid,
      (userTasks) => {
        setTasks(userTasks);
        setTasksLoading(false);
      },
      (err) => {
        console.error('Task sync error:', err);
        setTasksLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isFirebaseLive]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  // Toggle status (Pending <-> Completed)
  const handleToggleStatus = async (id: string) => {
    if (!currentUser) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const nextCompletedAt = nextStatus === 'Completed' ? Date.now() : null;

    // Instant optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus, completedAt: nextCompletedAt } : t))
    );

    try {
      await updateTask(currentUser.uid, id, {
        status: nextStatus,
        completedAt: nextCompletedAt,
      });
      showToast(nextStatus === 'Completed' ? 'Task completed! Growth graph updated' : 'Task marked as pending');
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      showToast('Failed to update task status');
    }
  };

  // Save (Add or Update)
  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>, taskId?: string) => {
    if (!currentUser) return;

    try {
      if (taskId) {
        const updates = {
          title: taskData.title,
          subject: taskData.subject,
          status: taskData.status,
          dueDate: taskData.dueDate,
          completedAt: taskData.status === 'Completed' ? Date.now() : null,
        };
        // Instant optimistic update
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));

        await updateTask(currentUser.uid, taskId, updates);
        showToast('Task updated successfully');
      } else {
        const created = await createTask(currentUser.uid, {
          title: taskData.title,
          subject: taskData.subject,
          status: taskData.status,
          dueDate: taskData.dueDate,
        });
        // Instant optimistic update
        setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
        showToast('New study task added');
      }
    } catch (err: any) {
      console.error('Error saving task:', err);
      showToast('Error saving task');
    }
  };

  // Delete
  const handleConfirmDelete = async (taskId: string) => {
    if (!currentUser) return;
    // Instant optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(currentUser.uid, taskId);
      showToast('Task deleted');
    } catch (err) {
      console.error('Failed to delete task:', err);
      showToast('Failed to delete task');
    }
  };

  // Safe Migration to Firestore
  const handleMigrate = async () => {
    if (!currentUser || !isFirebaseLive) return;
    setIsMigrating(true);
    try {
      const migrated = await migrateLocalTasksToFirestore(currentUser.uid);
      setLocalTaskCount(0);
      showToast(`Successfully migrated ${migrated} tasks to Cloud Firestore!`);
    } catch (err: any) {
      console.error('Migration failed:', err);
      showToast('Migration error: ' + (err.message || 'Failed to migrate'));
    } finally {
      setIsMigrating(false);
    }
  };

  // Open modal for new task
  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Compute counts
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  // Filter & Search
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Pending' && task.status !== 'Pending') return false;
    if (filter === 'Completed' && task.status !== 'Completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchSubject = task.subject.toLowerCase().includes(q);
      const matchStatus = task.status.toLowerCase().includes(q);
      return matchTitle || matchSubject || matchStatus;
    }
    return true;
  });

  // Auth loading gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#0c1f38] animate-spin mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading Student Planner...</p>
      </div>
    );
  }

  // Require login before showing personal tasks
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-200">
      {/* Top Navigation with user info, tabs & logout */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Container - Optimized for Mobile & Centered on Desktop */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 sm:py-6 pb-28">
        {/* Firebase Setup & Connection Guidance Banner */}
        <FirebaseSetupGuide isConfigured={isFirebaseLive} />

        {/* Cloud Migration Card (Shown only when Cloud DB is live and user has local tasks) */}
        {isFirebaseLive && localTaskCount > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div>
              <p className="text-xs font-bold text-[#0c1f38] flex items-center gap-1.5">
                <CloudUpload className="w-4 h-4 text-[#1e40af]" />
                Migrate Local Tasks to Cloud Database
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Found {localTaskCount} local {localTaskCount === 1 ? 'task' : 'tasks'} from preview mode. Safely transfer them to your Firestore cloud account.
              </p>
            </div>
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
              className="px-3.5 py-2 bg-[#0c1f38] hover:bg-[#163359] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs disabled:opacity-60 cursor-pointer self-start sm:self-auto flex-shrink-0"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Migrating...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Sync to Cloud</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 1: STUDY TASKS PLANNER */}
        {activeTab === 'tasks' && (
          <div className="animate-in fade-in duration-150">
            {/* Dashboard Title & Counters */}
            <DashboardStats
              totalCount={totalCount}
              pendingCount={pendingCount}
              completedCount={completedCount}
            />

            {/* Add Task Action Bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                  My Coursework Tasks
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                  {filteredTasks.length}
                </span>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0c1f38] hover:bg-[#163359] text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Filters and search */}
            {totalCount > 0 && (
              <TaskFilter
                currentFilter={filter}
                onFilterChange={setFilter}
                counts={{
                  all: totalCount,
                  pending: pendingCount,
                  completed: completedCount,
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}

            {/* Task List or Empty State */}
            {tasksLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0c1f38]" />
                <p className="text-xs">Loading your study tasks...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-2.5">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={(t) => setDeletingTask(t)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                isFiltered={totalCount > 0}
                onAddTask={handleOpenAddModal}
                onClearFilter={() => {
                  setFilter('All');
                  setSearchQuery('');
                }}
              />
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTIVITY GROWTH DASHBOARD */}
        {activeTab === 'growth' && (
          <GrowthDashboard
            tasks={tasks}
            onGoToTasks={() => setActiveTab('tasks')}
          />
        )}
      </main>

      {/* Floating Action Button for Mobile Android Phones (when on Tasks tab) */}
      {activeTab === 'tasks' && (
        <button
          onClick={handleOpenAddModal}
          aria-label="Add new study task"
          className="sm:hidden fixed bottom-5 right-5 z-20 w-14 h-14 rounded-full bg-[#0c1f38] hover:bg-[#163359] text-white flex items-center justify-center shadow-lg shadow-blue-950/20 active:scale-90 transition-transform cursor-pointer border-2 border-white/20"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Visual Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0c1f38] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium border border-blue-900/50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlannerApp />
    </AuthProvider>
  );
}
