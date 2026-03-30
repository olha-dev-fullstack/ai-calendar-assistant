import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "google/gemini-3-flash",
    system: "You are an AI Daily Planner assistant. Help users organize their day, prioritize tasks, and manage their schedule through conversation. You can analyze calendar screenshots and to-do list images shared by users. You can add, complete, and list tasks, as well as create, update, and delete calendar events based on user requests.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
