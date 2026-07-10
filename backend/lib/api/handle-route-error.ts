import { ZodError } from "zod";

import {
  ConflictError,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/api/errors";
import { apiError } from "@/lib/api/response";
import { AppError, getErrorMessage } from "@/utils/errors";

function formatZodError(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    details[path] = details[path] ?? [];
    details[path].push(issue.message);
  }

  return details;
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof ValidationError) {
    return apiError(error.message, error.statusCode, error.details);
  }

  if (error instanceof AppError) {
    return apiError(error.message, error.statusCode);
  }

  if (error instanceof ZodError) {
    return apiError("Validation failed.", 422, formatZodError(error));
  }

  if (isPrismaNotFoundError(error)) {
    return apiError(new NotFoundError("Visitor").message, 404);
  }

  if (isPrismaUniqueConstraintError(error)) {
    return apiError(
      new ConflictError("A visitor with this code already exists.").message,
      409,
    );
  }

  console.error("Unhandled API error:", error);

  return apiError(getErrorMessage(error), 500);
}

export { UnauthorizedError, NotFoundError, ValidationError, ConflictError };
