import { z } from "zod";

export const InputTaskSchema = z.object({
  title: z.string().describe("The title of the task"),
  description: z.string().optional().describe("Optional description of the task"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  time: z.string().optional().describe("Time in HH:MM 24-hour format"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium").describe("Priority level"),
});

export const CompleteTaskSchema = z.object({
  id: z.string().optional().describe("Exact task ID to complete"),
  title: z.string().optional().describe("Task title to search for (partial match allowed)"),
});

export const GetTasksSchema = z.object({
  status: z
    .enum(["pending", "completed", "all"])
    .optional()
    .default("all")
    .describe("Filter tasks by completion status"),
});
