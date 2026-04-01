import { z } from "zod";

export const InputTaskSchema = z.object({
  title: z.string().describe("The title of the task"),
  description: z
    .string()
    .optional()
    .describe("Optional description of the task"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  time: z.string().optional().describe("Time in HH:MM 24-hour format"),
  priority: z
    .enum(["low", "medium", "high"])
    .optional()
    .default("medium")
    .describe("Priority level"),
});

export const CompleteTaskSchema = z.object({
  id: z.string().optional().describe("Exact task ID to complete"),
  title: z
    .string()
    .optional()
    .describe("Task title to search for (partial match allowed)"),
});

export const GetTasksSchema = z.object({
  status: z
    .enum(["pending", "completed", "all"])
    .optional()
    .default("all")
    .describe("Filter tasks by completion status"),
});

export const DeleteTaskSchema = z.object({
  id: z.string().optional().describe("Exact task ID to delete"),
  title: z.string().optional().describe("Task title to search for (partial match allowed)"),
});

export const EditTaskSchema = z.object({
  id: z.string().optional().describe("Exact task ID to edit"),
  title: z.string().optional().describe("Task title to search for (partial match allowed)"),
  newTitle: z.string().optional().describe("New title for the task"),
  description: z.string().optional().describe("New description for the task"),
  date: z.string().optional().describe("New date in YYYY-MM-DD format"),
  time: z.string().optional().describe("New time in HH:MM 24-hour format"),
  priority: z.enum(["low", "medium", "high"]).optional().describe("New priority level"),
});

export const AnalysisSchema = z.object({
  topPriority: z
    .string()
    .describe(
      "The single most urgent task the user should tackle first, and why",
    ),
  suggestions: z
    .array(z.string())
    .describe(
      "2-4 concrete, actionable suggestions to improve productivity or task organization",
    ),
  conflicts: z
    .array(z.string())
    .describe(
      "Any scheduling conflicts, duplicate efforts, or priority mismatches found. Empty array if none.",
    ),
  overallAssessment: z
    .string()
    .describe("One-sentence summary of the overall health of the task list"),
});

export type TaskAnalysis = z.infer<typeof AnalysisSchema>;
