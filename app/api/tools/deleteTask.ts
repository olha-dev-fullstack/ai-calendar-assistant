import { tool } from "ai";
import { Task } from "@/app/types";
import { DeleteTaskSchema } from "./schema";

export function deleteTaskTool(tasks: Task[]) {
  return tool({
    description: "Delete a task from the user's planner by its ID or title",
    inputSchema: DeleteTaskSchema,
    execute: async ({ id, title }) => {
      const task =
        tasks.find((t) => (id ? t.id === id : false)) ??
        tasks.find(
          (t) => title && t.title.toLowerCase() === title.toLowerCase(),
        ) ??
        tasks.find(
          (t) => title && t.title.toLowerCase().includes(title.toLowerCase()),
        );

      if (!task) return { success: false, message: "Task not found" };
      return { success: true, id: task.id, title: task.title };
    },
  });
}
