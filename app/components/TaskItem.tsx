import { Calendar, Check, Clock, Trash2 } from "lucide-react";
import { Priority, Task } from "../types";

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-pink-orchid/40 text-amethyst-smoke-dark dark:bg-zinc-700 dark:text-zinc-400",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const TaskItem = ({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <li className="flex items-start gap-2 rounded-xl border border-periwinkle dark:border-zinc-700 bg-white/80 dark:bg-zinc-900 p-3">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-colors cursor-pointer ${
          task.completed
            ? "bg-amethyst-smoke border-[#9c89b8] text-white"
            : "border-periwinkle dark:border-zinc-600 hover:border-amethyst-smoke"
        }`}
      >
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${task.completed ? "line-through text-zinc-400" : ""}`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.date && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Calendar size={10} />
              {new Date(task.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
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
};
