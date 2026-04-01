import { AlertTriangle, Lightbulb, LoaderCircle, Sparkles } from "lucide-react";
import { TaskAnalysis } from "../api/tools/schema";

export const AnalysisBubble = ({
  analysis,
  isAnalyzing,
}: {
  analysis: TaskAnalysis | null;
  isAnalyzing: boolean;
}) => {
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="text-xs text-zinc-400 px-1">AI</span>
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 space-y-3 text-sm">
        {isAnalyzing ? (
          <span className="flex items-center gap-2 text-zinc-400 text-xs">
            <LoaderCircle size={13} className="animate-spin" /> Analyzing tasks…
          </span>
        ) : analysis ? (
          <>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs italic">
              {analysis.overallAssessment}
            </p>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-2.5 space-y-1">
              <p className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1 text-xs">
                <Sparkles size={11} /> Top priority
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {analysis.topPriority}
              </p>
            </div>
            {analysis.suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1 text-xs">
                  <Lightbulb size={11} /> Suggestions
                </p>
                <ul className="space-y-1 pl-1">
                  {analysis.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-1.5"
                    >
                      <span className="text-zinc-300 dark:text-zinc-600 shrink-0">
                        ·
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.conflicts.length > 0 && (
              <div className="space-y-1">
                <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-xs">
                  <AlertTriangle size={11} /> Conflicts
                </p>
                <ul className="space-y-1 pl-1">
                  {analysis.conflicts.map((c, i) => (
                    <li
                      key={i}
                      className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-1.5"
                    >
                      <span className="text-amber-400 shrink-0">·</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
