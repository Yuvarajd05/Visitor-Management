import { ZodError } from "zod";

import {
  ConflictError,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/server/api/errors";
import { apiError } from "@/server/api/response";
import { writeErrorLog } from "@/server/services/error-log.service";
import { AppError, getErrorMessage } from "@/server/utils/errors";

function formatZodError(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    details[path] = details[path] ?? [];
    details[path].push(issue.message);
  }

  return details;
}

export function handleRouteError(
  error: unknown,
  context?: { path?: string; method?: string; userId?: string },
): Response {
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

  void writeErrorLog({
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : null,
    path: context?.path,
    method: context?.method,
    statusCode: 500,
    userId: context?.userId,
  });

  return apiError("An unexpected error occurred.", 500);
}

export { UnauthorizedError, NotFoundError, ValidationError, ConflictError };
