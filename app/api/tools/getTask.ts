import { tool } from "ai";
import type { Task } from "../../context/TasksContext";
import { GetTasksSchema } from "./schema";

export function makeGetTasksTool(tasks: Task[]) {
  return tool({
    description: "Retrieve the user's tasks, optionally filtered by status",
    inputSchema: GetTasksSchema,
    execute: async ({ status }) => {
      const filtered = tasks.filter((t) => {
        if (status === "pending") return !t.completed;
        if (status === "completed") return t.completed;
        return true;
      });
      return { tasks: filtered, total: filtered.length };
    },
  });
}
