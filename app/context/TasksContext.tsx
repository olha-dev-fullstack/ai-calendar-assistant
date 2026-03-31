"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
};

type TasksContextValue = {
  tasks: Task[];
  addTask: (fields: Omit<Task, "id" | "completed" | "createdAt">) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

const STORAGE_KEY = "ai-planner-tasks";

// ─── Module-level store ───────────────────────────────────────────────────────
// Populated from localStorage once on the client at module load time.
// useSyncExternalStore reads from here; getServerSnapshot returns [] during SSR
// and initial hydration so the server HTML is always matched.

let currentTasks: Task[] = [];
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) currentTasks = JSON.parse(raw) as Task[];
  } catch {
    // corrupted storage — start fresh
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Task[] {
  return currentTasks;
}

const EMPTY_TASKS: Task[] = [];

function getServerSnapshot(): Task[] {
  return EMPTY_TASKS;
}

function persistTasks(next: Task[]) {
  currentTasks = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

// ─────────────────────────────────────────────────────────────────────────────

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const tasks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function addTask(fields: Omit<Task, "id" | "completed" | "createdAt">) {
    persistTasks([
      { ...fields, id: crypto.randomUUID(), completed: false, createdAt: Date.now() },
      ...currentTasks,
    ]);
  }

  function toggleComplete(id: string) {
    persistTasks(currentTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id: string) {
    persistTasks(currentTasks.filter((t) => t.id !== id));
  }

  return (
    <TasksContext.Provider value={{ tasks, addTask, toggleComplete, deleteTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}
