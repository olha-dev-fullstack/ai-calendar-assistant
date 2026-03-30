"use client";

import { Check, Clock, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Priority, Task, useTasks } from "../context/TasksContext";

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const EMPTY_FORM = { title: "", description: "", time: "", priority: "medium" as Priority };

export default function TaskPanel() {
  const { tasks, addTask, toggleComplete, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    addTask(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setError("");
  }

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  function close() {
    setShowForm(false);
    setError("");
    setForm(EMPTY_FORM);
  }

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
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors cursor-pointer"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "Add task"}
        </button>
      </div>

      {/* Popup overlay */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-10"
            onClick={close}
          />
          {/* Floating form */}
          <form
            onSubmit={handleAdd}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 left-3 right-3 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold">New task</p>
              <button type="button" onClick={close} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Task title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1.5 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-1.5 font-medium transition-colors cursor-pointer"
            >
              Add task
            </button>
          </form>
        </>
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
              <TaskGroup label="To do" tasks={pending} onToggle={toggleComplete} onDelete={deleteTask} />
            )}
            {completed.length > 0 && (
              <TaskGroup label="Completed" tasks={completed} onToggle={toggleComplete} onDelete={deleteTask} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskGroup({
  label,
  tasks,
  onToggle,
  onDelete,
}: {
  label: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">{label}</p>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="flex items-start gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-colors cursor-pointer ${
          task.completed
            ? "bg-blue-500 border-blue-500 text-white"
            : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400"
        }`}
      >
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${task.completed ? "line-through text-zinc-400" : ""}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.time && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Clock size={10} />
              {task.time}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}
