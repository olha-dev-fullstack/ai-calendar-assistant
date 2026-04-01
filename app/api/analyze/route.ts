import { generateText, Output } from "ai";
import type { Task } from "../../types";
import { AnalysisSchema } from "../tools/schema";
import { getCurrentTimeTool } from "../tools";
import { getIp, rateLimit, tooManyRequests } from "@/app/lib/rateLimit";

export async function POST(req: Request) {
  const { success, retryAfterMs } = rateLimit(getIp(req), 5, 60_000);
  if (!success) return tooManyRequests(retryAfterMs);

  const { tasks }: { tasks: Task[] } = await req.json();

  if (!tasks.length) {
    return Response.json({ error: "No tasks to analyze" }, { status: 400 });
  }

  const { output } = await generateText({
    model: "google/gemini-3-flash",
    system:
      "You are a productivity coach. Analyze the provided task list and return structured, actionable insights. Be concise and specific. Give time-based tasks suggestions",
    prompt: `Analyze this task list:\n${JSON.stringify(tasks, null, 2)}`,
    output: Output.object({ schema: AnalysisSchema }),
    tools: {
      getCurrentTime: getCurrentTimeTool,
    },
  });

  return Response.json(output);
}
