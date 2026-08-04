import { AppError } from "@/server/utils/errors";

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized. Please sign in to continue.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed.",
    public readonly details?: Record<string, string[]>,
  ) {
    super(message, 422);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "A conflict occurred while processing the request.") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export function isPrismaNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}

export function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}
