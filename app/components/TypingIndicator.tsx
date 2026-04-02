const TypingIndicator = () => {
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="text-xs text-zinc-400 px-1">AI</span>
      <div className="bg-lavender-blush dark:bg-zinc-800 rounded-2xl px-4 py-3 flex gap-1 items-center">
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-amethyst-smoke"
            style={{
              display: "inline-block",
              animation: "dot-bounce 1.2s infinite ease-in-out",
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
export default TypingIndicator;
