export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface ApiMessageResponse {
  success: true;
  message: string;
}

export function apiSuccess<T>(
  data: T,
  message?: string,
  init?: ResponseInit,
): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };

  return Response.json(body, { status: 200, ...init });
}

export function apiCreated<T>(data: T, message?: string): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };

  return Response.json(body, { status: 201 });
}

export function apiMessage(message: string, status = 200): Response {
  const body: ApiMessageResponse = {
    success: true,
    message,
  };

  return Response.json(body, { status });
}

export function apiError(
  error: string,
  status = 400,
  details?: Record<string, string[]>,
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error,
    ...(details ? { details } : {}),
  };

  return Response.json(body, { status });
}
