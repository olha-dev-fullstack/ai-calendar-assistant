"use client";

import { useChat } from "@ai-sdk/react";
import {
  convertFileListToFileUIParts,
  DefaultChatTransport,
  FileUIPart,
} from "ai";
import {
  CheckCircle,
  Clock,
  ListTodo,
  LoaderCircle,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Trash2,
  X
} from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AnalysisBubble } from "./components/AnalysisBubble";
import MarkdownWrapper from "./components/MarkdownWrapper";
import TaskPanel from "./components/TaskPanel";
import TypingIndicator from "./components/TypingIndicator";
import { useTasks } from "./context/TasksContext";

export default function Chat() {
  const { tasks, addTask, toggleComplete, editTask, deleteTask, analysis, isAnalyzing } = useTasks();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const [analysisAnchorIndex, setAnalysisAnchorIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef(tasks);

  const processedToolCallIds = useRef(new Set<string>());

  const transport = useMemo(() => {
    // eslint-disable-next-line react-hooks/refs
    return new DefaultChatTransport({
      body: () => ({ tasks: tasksRef.current }),
    });
  }, [tasksRef]);

  const { messages, sendMessage, status, error } = useChat({ transport });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, analysis?.overallAssessment.length, isAnalyzing]);

  useEffect(() => {
    if (isAnalyzing) setAnalysisAnchorIndex(messages.length);
  }, [isAnalyzing]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks.length, toggleComplete, deleteTask, editTask]);

  useEffect(() => {
    for (const message of messages) {
      if (message.role !== "assistant") continue;
      for (const part of message.parts) {
        if (!part.type.startsWith("tool-") || part.type === "dynamic-tool")
          continue;
        const p = part as {
          type: string;
          toolCallId: string;
          state: string;
          output?: unknown;
        };
        if (p.state !== "output-available") continue;
        if (processedToolCallIds.current.has(p.toolCallId)) continue;
        processedToolCallIds.current.add(p.toolCallId);

        const toolName = p.type.slice(5); // strip "tool-" prefix
        const output = p.output as Record<string, unknown>;
        if (toolName === "addTask") {
          addTask(output as Parameters<typeof addTask>[0]);
        } else if (toolName === "completeTask" && output?.success) {
          toggleComplete(output.id as string);
        } else if (toolName === "deleteTask" && output?.success) {
          deleteTask(output.id as string);
        } else if (toolName === "editTask" && output?.success) {
          editTask(
            output.id as string,
            output.updates as Parameters<typeof editTask>[1],
          );
        }
      }
    }
  }, [messages, addTask, toggleComplete]);

  const isLoading = status === "submitted" || status === "streaming";

  async function addFiles(fileList: FileList) {
    const imageParts = Array.from(fileList).filter(
      (f) => f.type === "image/png" || f.type === "image/jpeg",
    );
    if (imageParts.length === 0) return;
    const dataTransfer = new DataTransfer();
    imageParts.forEach((f) => dataTransfer.items.add(f));
    const parts = await convertFileListToFileUIParts(dataTransfer.files);
    setFiles((prev) => [...prev, ...parts]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    await sendMessage({ text: input, files });
    setInput("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      await addFiles(e.clipboardData.files);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex h-screen w-full max-w-5xl mx-auto border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      {/* Chat panel */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="font-semibold text-sm">Chat</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, msgIndex) => {
            const showAnalysisAfter =
              (analysis || isAnalyzing) &&
              analysisAnchorIndex !== null &&
              msgIndex + 1 === analysisAnchorIndex;
            const isLastMessage = msgIndex === messages.length - 1;
            const isStreamingThisMessage =
              isLastMessage &&
              message.role === "assistant" &&
              status === "streaming";
            const textParts = message.parts.filter((p) => p.type === "text");
            return (
              <Fragment key={message.id}>
              <div
                className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <span className="text-xs text-zinc-400 px-1">
                  {message.role === "user" ? "You" : "AI"}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      const isLastTextPart =
                        isStreamingThisMessage &&
                        i ===
                          message.parts.lastIndexOf(
                            textParts[textParts.length - 1],
                          );
                      if (message.role === "assistant") {
                        return (
                          <span
                            key={`${message.id}-${i}`}
                            className={isLastTextPart ? "streaming-cursor" : ""}
                          >
                            <MarkdownWrapper part={part} />
                          </span>
                        );
                      }
                      return (
                        <span key={`${message.id}-${i}`}>{part.text}</span>
                      );
                    }
                    if (
                      part.type === "file" &&
                      part.mediaType.startsWith("image/")
                    ) {
                      return (
                        <Image
                          key={`${message.id}-${i}`}
                          src={part.url}
                          alt={part.filename ?? "uploaded image"}
                          className="mt-2 max-w-full rounded-lg max-h-64 object-contain"
                          width={256}
                          height={256}
                        />
                      );
                    }
                    if (
                      part.type.startsWith("tool-") &&
                      part.type !== "dynamic-tool"
                    ) {
                      const p = part as { type: string; state: string };
                      const toolName = p.type.slice(5);
                      const isPending =
                        p.state !== "output-available" &&
                        p.state !== "output-error";
                      const label: Record<string, string> = {
                        addTask: "Adding task",
                        completeTask: "Completing task",
                        deleteTask: "Deleting task",
                        editTask: "Editing task",
                        getTasks: "Fetching tasks",
                        getCurrentTime: "Checking time",
                      };
                      const icon: Record<string, React.ReactNode> = {
                        addTask: <Plus size={12} />,
                        completeTask: <CheckCircle size={12} />,
                        deleteTask: <Trash2 size={12} />,
                        editTask: <Pencil size={12} />,
                        getTasks: <ListTodo size={12} />,
                        getCurrentTime: <Clock size={12} />,
                      };
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 my-1"
                        >
                          {isPending ? (
                            <LoaderCircle size={12} className="animate-spin" />
                          ) : (
                            (icon[toolName] ?? <CheckCircle size={12} />)
                          )}
                          <span>
                            {isPending
                              ? (label[toolName] ?? toolName)
                              : `${label[toolName] ?? toolName} done`}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              {showAnalysisAfter && <AnalysisBubble analysis={analysis} isAnalyzing={isAnalyzing} />}
              </Fragment>
            );
          })}

          {/* Analysis bubble when triggered with no messages */}
          {(analysis || isAnalyzing) && analysisAnchorIndex === 0 && (
            <AnalysisBubble analysis={analysis} isAnalyzing={isAnalyzing} />
          )}

          {/* Typing indicator — shown while waiting for first token */}
          {status === "submitted" && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 space-y-2">
          {error && (
            <p className="text-red-500 text-sm px-1">{error.message}</p>
          )}

          {/* Image previews */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="relative h-16 w-16 rounded overflow-hidden border border-zinc-200 dark:border-zinc-700"
                >
                  <Image
                    src={file.url}
                    alt={file.filename ?? "preview"}
                    className="h-full w-full object-cover"
                    width={64}
                    height={64}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-0 right-0 bg-black/60 text-white text-xs leading-none p-0.5 rounded-bl cursor-pointer hover:bg-black/80"
                  >
                    <X />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-shrink-0 p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Attach image"
            >
              <Paperclip />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />

            {/* Textarea */}
            <textarea
              className="flex-1 min-h-[80px] resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              value={input}
              placeholder="Ask me to help organize your day..."
              disabled={isLoading}
              rows={3}
              onChange={(e) => setInput(e.currentTarget.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && files.length === 0)}
              className="flex-shrink-0 rounded-full bg-blue-500 p-2.5 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              {isLoading ? (
                <LoaderCircle
                  className="animate-spin"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              ) : (
                <Send width={18} height={18} />
              )}
            </button>
          </form>
        </div>
        {/* Task panel */}
      </div>
      <div className="w-80 flex-shrink-0">
        <TaskPanel />
      </div>
    </div>
  );
}
