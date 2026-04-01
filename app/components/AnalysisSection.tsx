import { LoaderCircle, Sparkles } from "lucide-react";
import { useTasks } from "../context/TasksContext";

export const AnalysisSection = () => {
  const { isAnalyzing, analyzeError, analyze } = useTasks();
  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 space-y-3">
      <button
        onClick={() => analyze()}
        disabled={isAnalyzing}
        className="w-full flex items-center justify-center gap-2 text-xs font-medium rounded-lg py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {isAnalyzing ? (
          <LoaderCircle size={13} className="animate-spin" />
        ) : (
          <Sparkles size={13} />
        )}
        {isAnalyzing ? "Analyzing…" : "Analyze tasks"}
      </button>

      {analyzeError && <p className="text-xs text-red-500">{analyzeError}</p>}
    </div>
  );
};
