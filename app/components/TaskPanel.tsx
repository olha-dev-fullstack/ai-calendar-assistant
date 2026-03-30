"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useTasks } from "../context/TasksContext";
import AddTaskForm from "./AddTaskForm";
import TaskGroup from "./TaskGroup";

export default function TaskPanel() {
  const { tasks, toggleComplete, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="flex flex-col h-full border-l border-zinc-200 dark:border-zinc-700 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm">Tasks</h2>
          {pending.length > 0 && (
            <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 leading-none">
              {pending.length}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setError("");
          }}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors cursor-pointer"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "Add task"}
        </button>
      </div>

      {/* Popup overlay */}
      {showForm && (
        <AddTaskForm showForm={showForm} setShowForm={setShowForm} />
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center mt-8 px-4">
            No tasks yet. Add one above or ask the AI to help plan your day.
          </p>
        ) : (
          <div className="p-3 space-y-4">
            {pending.length > 0 && (
              <TaskGroup
                label="To do"
                tasks={pending}
                onToggle={toggleComplete}
                onDelete={deleteTask}
              />
            )}
            {completed.length > 0 && (
              <TaskGroup
                label="Completed"
                tasks={completed}
                onToggle={toggleComplete}
                onDelete={deleteTask}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
