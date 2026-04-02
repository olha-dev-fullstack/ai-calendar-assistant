import { Task } from "../types";
import { TaskItem } from "./TaskItem";

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
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskGroup;
