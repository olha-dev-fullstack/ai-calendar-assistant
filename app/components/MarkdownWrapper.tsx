import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownWrapper({ part }: { part: { text: string } }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
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
          <h1 className="text-base font-bold mb-1">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-1">{children}</h3>
        ),
      }}
    >
      {part.text}
    </ReactMarkdown>
  );
}
