import { tool } from "ai";
import { InputTaskSchema } from "./schema";

export const addTaskTool = tool({
  description: "Add a new task to the user's planner",
  inputSchema: InputTaskSchema,
  execute: async ({ title, description, date, time, priority }) => ({
    title,
    description: description ?? "",
    date: date ?? "",
    time: time ?? "",
    priority: priority ?? "medium",
  }),
});
