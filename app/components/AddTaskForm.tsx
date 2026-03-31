"use client";

import { Calendar, Clock, X } from "lucide-react";
import { useState } from "react";
import { Priority, useTasks } from "../context/TasksContext";
import { useAICompletion } from "../hooks/useAICompletion";
import { set } from "zod";

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  priority: "medium" as Priority,
};

const INPUT_CLASS =
  "w-full text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

const AddTaskForm = ({
  setShowForm,
}: {
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { addTask } = useTasks();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  const titleCompletion = useAICompletion("title", form.title);
  const descCompletion = useAICompletion("description", form.description, form.title);

  const todayStr = new Date().toLocaleDateString("en-CA");
  const nowTimeStr = new Date().toTimeString().slice(0, 5);
  const isToday = form.date === todayStr;

  const close = () => {
    setShowForm(false);
    setError("");
    setForm(EMPTY_FORM);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    addTask(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setError("");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 z-10" onClick={close} />

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

        {/* Title — input + ghost suggestion in same flex row */}
        <div className="flex items-center rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
          <input
            autoFocus
            type="text"
            placeholder="Task title *"
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onFocus={setTitleFocused.bind(null, true)}  
            onBlur={setTitleFocused.bind(null, false)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && titleCompletion.suggestion) {
                e.preventDefault();
                titleCompletion.accept((v) => setForm((f) => ({ ...f, title: v })));
              } else if (e.key === "Escape") {
                titleCompletion.dismiss();
              }
            }}
            className="flex-1 min-w-0 text-sm pl-3 py-1.5 bg-transparent outline-none wrap-words"
          />
            <span className="text-sm text-zinc-300 dark:text-zinc-600 pointer-events-none">
            {titleFocused && titleCompletion.suggestion  ? " " +titleCompletion.suggestion : "\u00A0"}
          </span>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Description — textarea + ghost suggestion continuation */}
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-blue-500">
          <textarea
            placeholder="Description (optional)"
            value={form.description ?? ""}
            rows={5}
            onFocus={setDescFocused.bind(null, true)}
            onBlur={setDescFocused.bind(null, false)}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Tab" && descCompletion.suggestion) {
                e.preventDefault();
                descCompletion.accept((v) => setForm((f) => ({ ...f, description: v })));
              } else if (e.key === "Escape") {
                descCompletion.dismiss();
              }
            }}
            className="w-full text-sm px-3 pt-1.5 pb-0 bg-transparent outline-none resize-none"
          />
          <span className="text-sm text-zinc-300 dark:text-zinc-600 pointer-events-none">
            {descFocused && descCompletion.suggestion  ? descCompletion.suggestion : "\u00A0"}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1">
            <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="date"
              value={form.date ?? ""}
              min={todayStr}
              onChange={(e) => {
                const newDate = e.target.value;
                const newIsToday = newDate === todayStr;
                const timeIsInPast = newIsToday && (form.time ?? "") < nowTimeStr;
                setForm({ ...form, date: newDate, time: timeIsInPast ? "" : (form.time ?? "") });
              }}
              className={`${INPUT_CLASS} pl-8`}
            />
          </div>
          <div className="relative flex-1">
            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="time"
              value={form.time ?? ""}
              min={isToday ? nowTimeStr : undefined}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className={`${INPUT_CLASS} pl-8`}
            />
          </div>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            className={INPUT_CLASS}
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
  );
};


export default AddTaskForm;
