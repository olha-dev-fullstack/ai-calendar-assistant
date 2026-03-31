import { tool } from "ai";
import type { Task } from "../../context/TasksContext";
import { CompleteTaskSchema } from "./schema";

export function makeCompleteTaskTool(tasks: Task[]) {
  return tool({
    description: "Mark a task as completed by its ID or title",
    inputSchema: CompleteTaskSchema,
    execute: async ({ id, title }) => {
      const task =
        tasks.find((t) => (id ? t.id === id : false)) ??
        tasks.find((t) => title && t.title.toLowerCase() === title.toLowerCase()) ??
        tasks.find((t) => title && t.title.toLowerCase().includes(title.toLowerCase()));

      if (!task) return { success: false, message: "Task not found" };
      if (task.completed) return { success: false, message: `"${task.title}" is already completed` };

      return { success: true, id: task.id, title: task.title };
    },
  });
}
