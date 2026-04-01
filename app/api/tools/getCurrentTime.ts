import { tool } from "ai";
import { z } from "zod";

export const getCurrentTimeTool = tool({
  description:
    "Get the current date and time. Use this whenever the user asks about time or you need to know the current date.",
  inputSchema: z.object({}),
  execute: async () => ({
    datetime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }),
});
