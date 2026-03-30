import { streamText } from "ai";

export async function POST(req: Request) {
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
      ? `You are an autocomplete engine for a daily planner app. Complete the task title the user is typing. Reply with ONLY the completion (the part that comes after what the user already typed). No quotes, no explanation. Under 8 words.`
      : `You are an autocomplete engine for a daily planner app. Complete the task description the user is typing. Task title: "${title ?? ""}". Reply with ONLY the completion (the part that comes after what the user already typed). No quotes, no explanation. Under 15 words.`;

  const result = streamText({
    model: "google/gemini-3-flash",
    system: systemPrompt,
    prompt,
    maxOutputTokens: 25,
  });

  return result.toTextStreamResponse();
}
