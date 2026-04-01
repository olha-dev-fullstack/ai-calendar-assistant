// In-memory sliding-window rate limiter.
// Works per-process — suitable for single-instance / development use.
// For multi-instance deployments, swap the Map for a Redis-backed store.

const store = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const retryAfterMs = timestamps[0] - windowStart;
    store.set(key, timestamps);
    return { success: false, remaining: 0, retryAfterMs };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { success: true, remaining: limit - timestamps.length, retryAfterMs: 0 };
}

export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function tooManyRequests(retryAfterMs: number): Response {
  return new Response("Too Many Requests", {
    status: 429,
    headers: {
      "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
    },
  });
}
