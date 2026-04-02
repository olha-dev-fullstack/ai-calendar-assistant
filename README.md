# AI Calendar Assistant

A conversational AI daily planner that lets you manage tasks through natural language chat. Ask the AI to add, edit, complete, or delete tasks — or upload a screenshot of your calendar and let it parse your schedule.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
| AI SDK | Vercel AI SDK v6 (`ai`, `@ai-sdk/react`) |
| Chat model | Google Gemini 3 Flash (via AI Gateway) |
| Autocomplete model | Anthropic Claude 3.5 Haiku (via AI Gateway) |
| Schema validation | Zod v4 |

---

## Features

### Chat
- Streaming AI chat powered by Gemini 3 Flash
- Send text messages and attach PNG/JPEG images (paste or file picker)
- The AI can read calendar screenshots and to-do list images
- Markdown rendering in assistant messages

### Task management via AI tools
The assistant has access to six tools it invokes automatically during conversation:

| Tool | What it does |
|---|---|
| `addTask` | Creates a new task with title, description, date, time, and priority |
| `completeTask` | Marks a task as done by ID or fuzzy title match |
| `deleteTask` | Removes a task by ID or fuzzy title match |
| `editTask` | Updates any field of an existing task |
| `getTasks` | Fetches the task list (filtered by status) |
| `getCurrentTime` | Returns the current date/time (used for relative scheduling) |

### Task panel
- Sidebar showing pending and completed tasks
- Manual task creation form with AI-powered autocomplete for title and description fields (Tab to accept)
- Per-task priority badges (High / Medium / Low), date, and time
- Toggle complete, delete

### Task analysis
- "Analyze tasks" button sends the full task list to a separate AI endpoint
- Returns: top priority recommendation, 2–4 productivity suggestions, scheduling conflicts, and an overall assessment
- Result appears inline in the chat at the position it was triggered

### Rate limiting
- `/api/chat` — 20 requests per minute per IP
- `/api/analyze` — 5 requests per minute per IP
- `/api/completion` — 60 requests per minute per IP

---

## Project structure

```
app/
├── api/
│   ├── chat/route.ts          # Streaming chat endpoint
│   ├── analyze/route.ts       # Task analysis endpoint
│   ├── completion/route.ts    # Autocomplete endpoint
│   └── tools/                 # AI tool definitions + Zod schemas
├── components/
│   ├── TaskPanel.tsx          # Sidebar with task list
│   ├── TaskItem.tsx           # Individual task card
│   ├── TaskGroup.tsx          # Pending / Completed groups
│   ├── AddTaskForm.tsx        # Manual task creation form
│   ├── AnalysisBubble.tsx     # AI analysis result in chat
│   ├── AnalysisSection.tsx    # Analyze button in sidebar
│   ├── TypingIndicator.tsx    # Animated dots while AI responds
│   └── MarkdownWrapper.tsx    # Renders assistant markdown
├── context/
│   └── TasksContext.tsx       # Global task state + analysis state
├── hooks/
│   ├── useAICompletion.ts     # Debounced autocomplete hook
│   └── useAnalysis.ts         # Task analysis fetch hook
├── lib/
│   └── rateLimit.ts           # In-memory rate limiter
├── globals.css                # Tailwind v4 theme + color palette
├── layout.tsx
├── page.tsx                   # Main chat page
└── types.ts                   # Task type definitions
```

---

## Running locally

### Prerequisites
- Node.js 18+
- An AI Gateway API key (OpenRouter or compatible gateway that routes to Google and Anthropic models)

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-calendar-assistant
npm install
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```env
AI_GATEWAY_API_KEY=your_api_key_here
```

The app routes all AI calls through a single gateway key. The chat and analysis routes use `google/gemini-3-flash` and the autocomplete route uses `anthropic/claude-3.5-haiku`.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
