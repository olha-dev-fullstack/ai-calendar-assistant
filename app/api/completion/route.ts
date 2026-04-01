import { streamText } from "ai";
import { getIp, rateLimit, tooManyRequests } from "@/app/lib/rateLimit";

export async function POST(req: Request) {
  const { success, retryAfterMs } = rateLimit(getIp(req), 60, 60_000);
  if (!success) return tooManyRequests(retryAfterMs);

  const { prompt, field, title } = (await req.json()) as {
    prompt: string; // the value the user has typed so far (sent by useCompletion)
    field: "title" | "description";
    title?: string;
  };

  if (!prompt || prompt.trim().length < 3) {
    return new Response("", { status: 200 });
  }

  const systemPrompt =
    field === "title"
      ? `You are an autocomplete engine for a daily planner app. Complete the task title the user is typing. Reply with ONLY the completion (the part that comes after what the user already typed). No quotes, no explanation. Under 4 words.`
      : `You are an autocomplete engine for a daily planner app. Complete the task description the user is typing. Task title: "${title ?? ""}". Reply with ONLY the completion (the part that comes after what the user already typed). No quotes, no explanation. Under 15 words.`;

  const result = streamText({
    model: "anthropic/claude-3.5-haiku",
    system: systemPrompt,
    prompt,
    maxOutputTokens: 25,
  });

  return result.toTextStreamResponse();
}
