import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import type { Task } from "../../context/TasksContext";
import { addTaskTool } from "../tools/addTask";
import { makeCompleteTaskTool } from "../tools/completeTask";
import { makeGetTasksTool } from "../tools/getTask";
import { getCurrentTimeTool } from "../tools/getCurrentTime";

export async function POST(req: Request) {
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
      completeTask: makeCompleteTaskTool(tasks),
      getTasks: makeGetTasksTool(tasks),
      getCurrentTime: getCurrentTimeTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
