"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Task[];
    } catch {
      // corrupted storage — start fresh
    }
    return [];
  });

  function persist(next: Task[]) {
    setTasks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addTask(fields: Omit<Task, "id" | "completed" | "createdAt">) {
    persist([
      { ...fields, id: crypto.randomUUID(), completed: false, createdAt: Date.now() },
      ...tasks,
    ]);
  }

  function toggleComplete(id: string) {
    persist(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id: string) {
    persist(tasks.filter((t) => t.id !== id));
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
