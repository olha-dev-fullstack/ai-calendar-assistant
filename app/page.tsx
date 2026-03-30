"use client";

import { useChat } from "@ai-sdk/react";
import { convertFileListToFileUIParts, FileUIPart } from "ai";
import { LoaderCircle, Paperclip, Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error } = useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);
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
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto justify-end align-items-stretch border border-zinc-200 dark:border-zinc-700 rounded-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, msgIndex) => {
          const isLastMessage = msgIndex === messages.length - 1;
          const isStreamingThisMessage =
            isLastMessage &&
            message.role === "assistant" &&
            status === "streaming";
          const textParts = message.parts.filter((p) => p.type === "text");
          return (
            <div
              key={message.id}
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
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 mb-2 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 mb-2 space-y-1">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => <li>{children}</li>,
                              strong: ({ children }) => (
                                <strong className="font-semibold">
                                  {children}
                                </strong>
                              ),
                              code: ({ children }) => (
                                <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-black/10 dark:bg-white/10 rounded p-2 my-2 overflow-x-auto text-xs font-mono">
                                  {children}
                                </pre>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-base font-bold mb-1">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-sm font-bold mb-1">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold mb-1">
                                  {children}
                                </h3>
                              ),
                            }}
                          >
                            {part.text}
                          </ReactMarkdown>
                        </span>
                      );
                    }
                    return <span key={`${message.id}-${i}`}>{part.text}</span>;
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
                  return null;
                })}
              </div>
            </div>
          );
        })}

        {/* Typing indicator — shown while waiting for first token */}
        {status === "submitted" && (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs text-zinc-400 px-1">AI</span>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3 flex gap-1 items-center">
              {[0, 0.2, 0.4].map((delay, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-zinc-400"
                  style={{
                    display: "inline-block",
                    animation: "dot-bounce 1.2s infinite ease-in-out",
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 space-y-2">
        {error && <p className="text-red-500 text-sm px-1">{error.message}</p>}

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
    </div>
  );
}
