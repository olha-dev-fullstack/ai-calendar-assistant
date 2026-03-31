"use client";

import { useCompletion } from "@ai-sdk/react";
import { useCallback, useEffect, useRef } from "react";

export function useAICompletion(
  field: "title" | "description",
  value: string,
  title?: string,
) {
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { completion, complete, isLoading, stop, setCompletion } = useCompletion({
    api: "/api/completion",
    streamProtocol: "text",
  });

  const completeRef = useRef(complete);
  const setCompletionRef = useRef(setCompletion);

  useEffect(() => {
    completeRef.current = complete;
    setCompletionRef.current = setCompletion;
  }, [complete, setCompletion]);

  useEffect(() => {
    setCompletionRef.current("");
    if (value.trim().length < 3) {
      doneRef.current = false;
      return;
    }
    if (doneRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      completeRef.current(value, { body: { field, title } });
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, field, title]);

  const accept = useCallback(
    (setter: (v: string) => void) => {
      if (!completion) return;
      setter(value + completion);
      setCompletion("");
    },
    [value, completion, setCompletion],
  );

  const dismiss = useCallback(() => {
    stop();
    setCompletion("");
    doneRef.current = true;
  }, [stop, setCompletion]);

  return { suggestion: completion, loading: isLoading, accept, dismiss };
}
