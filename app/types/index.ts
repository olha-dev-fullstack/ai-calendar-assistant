export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
};