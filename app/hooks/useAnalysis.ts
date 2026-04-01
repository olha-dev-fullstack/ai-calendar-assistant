"use client";

import { useState } from "react";
import { Task } from "../types";
import { TaskAnalysis } from "../api/tools/schema";

export const useAnalysis = () => {
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  async function analyze(tasks: Task[]) {
    setIsAnalyzing(true);
    setAnalyzeError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      if (!res.ok) throw new Error(await res.text());
      setAnalysis(await res.json());
    } catch {
      setAnalyzeError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }
  return { analysis, isAnalyzing, analyzeError, analyze };
};
