import { ZodError, type ZodType } from "zod";

import { ValidationError } from "@/server/api/errors";

export function parseRequestBody<T>(schema: ZodType<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const details: Record<string, string[]> = {};

      for (const issue of error.issues) {
        const path = issue.path.join(".") || "form";
        details[path] = details[path] ?? [];
        details[path].push(issue.message);
      }

      throw new ValidationError("Validation failed.", details);
    }

    throw error;
  }
}

export function parseSearchParams<T>(
  schema: ZodType<T>,
  searchParams: URLSearchParams,
): T {
  const raw = Object.fromEntries(searchParams.entries());

  try {
    return schema.parse(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      const details: Record<string, string[]> = {};

      for (const issue of error.issues) {
        const path = issue.path.join(".") || "query";
        details[path] = details[path] ?? [];
        details[path].push(issue.message);
      }

      throw new ValidationError("Invalid query parameters.", details);
    }

    throw error;
  }
}
