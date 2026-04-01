"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { TaskAnalysis } from "../api/tools/schema";
import { Task } from "../types";


type TasksContextValue = {
  tasks: Task[];
  addTask: (fields: Omit<Task, "id" | "completed" | "createdAt">) => void;
  toggleComplete: (id: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, "id" | "completed" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  analysis: TaskAnalysis | null;
  isAnalyzing: boolean;
  analyzeError: string;
  analyze: () => Promise<void>;
  clearAnalysis: () => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

const STORAGE_KEY = "ai-planner-tasks";

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

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const tasks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  function addTask(fields: Omit<Task, "id" | "completed" | "createdAt">) {
    persistTasks([
      { ...fields, id: crypto.randomUUID(), completed: false, createdAt: Date.now() },
      ...currentTasks,
    ]);
  }

  function toggleComplete(id: string) {
    persistTasks(currentTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function editTask(id: string, updates: Partial<Omit<Task, "id" | "completed" | "createdAt">>) {
    persistTasks(currentTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  function deleteTask(id: string) {
    persistTasks(currentTasks.filter((t) => t.id !== id));
  }

  function clearAnalysis() {
    setAnalysis(null);
    setAnalyzeError("");
  }

  async function analyze() {
    setIsAnalyzing(true);
    setAnalyzeError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: currentTasks }),
      });
      if (!res.ok) throw new Error(await res.text());
      setAnalysis(await res.json());
    } catch {
      setAnalyzeError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <TasksContext.Provider value={{ tasks, addTask, toggleComplete, editTask, deleteTask, analysis, isAnalyzing, analyzeError, analyze, clearAnalysis }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}
