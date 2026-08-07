type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

export function checkRateLimit(input: {
  key: string;
  windowMs: number;
  maxAttempts: number;
}): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = buckets.get(input.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= input.maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }

  existing.count += 1;
  buckets.set(input.key, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getRequestIp(request: Request): string {
  // Prefer nginx X-Real-IP ($remote_addr) — not client-spoofable when set at the edge.
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // When a trusted proxy appends the connecting IP, it is the rightmost hop.
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    return parts[parts.length - 1] || "unknown";
  }

  return "unknown";
}
