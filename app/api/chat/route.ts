import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import {
  addTaskTool,
  completeTaskTool,
  deleteTaskTool,
  editTaskTool,
  getCurrentTimeTool,
  getTasksTool,
} from "../tools";
import { Task } from "@/app/types";
import { getIp, rateLimit, tooManyRequests } from "@/app/lib/rateLimit";

export async function POST(req: Request) {
  const { success, retryAfterMs } = rateLimit(getIp(req), 20, 60_000);
  if (!success) return tooManyRequests(retryAfterMs);

  const { messages, tasks = [] }: { messages: UIMessage[]; tasks: Task[] } =
    await req.json();

  const result = streamText({
    model: "google/gemini-3-flash",
    system:
      "You are an AI Daily Planner assistant. Help users organize their day, prioritize tasks, and manage their schedule through conversation. You can analyze calendar screenshots and to-do list images shared by users. Use your tools to add tasks, mark them complete, and retrieve them when needed. Always use getCurrentTime when the user refers to relative dates like 'today' or 'tomorrow'.",
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      addTask: addTaskTool,
      completeTask: completeTaskTool(tasks),
      deleteTask: deleteTaskTool(tasks),
      editTask: editTaskTool(tasks),
      getTasks: getTasksTool(tasks),
      getCurrentTime: getCurrentTimeTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
