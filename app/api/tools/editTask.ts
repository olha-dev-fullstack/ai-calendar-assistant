import { tool } from "ai";
import { Task } from "@/app/types";
import { EditTaskSchema } from "./schema";

export function editTaskTool(tasks: Task[]) {
  return tool({
    description: "Edit an existing task's fields (title, description, date, time, or priority)",
    inputSchema: EditTaskSchema,
    execute: async ({ id, title, newTitle, description, date, time, priority }) => {
      const task =
        tasks.find((t) => (id ? t.id === id : false)) ??
        tasks.find(
          (t) => title && t.title.toLowerCase() === title.toLowerCase(),
        ) ??
        tasks.find(
          (t) => title && t.title.toLowerCase().includes(title.toLowerCase()),
        );

      if (!task) return { success: false, message: "Task not found" };

      const updates: Partial<Omit<Task, "id" | "completed" | "createdAt">> = {};
      if (newTitle !== undefined) updates.title = newTitle;
      if (description !== undefined) updates.description = description;
      if (date !== undefined) updates.date = date;
      if (time !== undefined) updates.time = time;
      if (priority !== undefined) updates.priority = priority;

      if (Object.keys(updates).length === 0)
        return { success: false, message: "No fields to update provided" };

      return { success: true, id: task.id, updates };
    },
  });
}
