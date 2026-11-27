import { API_BASE_URL } from '@/src/api/config';
import { clearSession, getToken } from '@/src/storage/secureSession';

export class ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; data?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.data = options?.data;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.'
): string {
  if (error instanceof ApiError) {
    if (error.message) return error.message;
  }
  if (error instanceof TypeError) {
    return 'Could not reach the server. Is the backend running?';
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: string }).message ?? '');
    if (message) return message;
  }
  return fallback;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = false, signal, headers = {} } = options;
  const finalHeaders: Record<string, string> = { ...headers };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    method,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    signal,
  });

  const data = await parseBody(response);

  if (response.status === 401) {
    await clearSession();
    onUnauthorized?.();
    throw new ApiError(
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: string }).message)
        : 'Unauthorized',
      { status: 401, data }
    );
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: string }).message)
        : typeof data === 'string' && data.trim()
          ? data
          : `Request failed (${response.status})`;
    throw new ApiError(message, {
      status: response.status,
      code:
        typeof data === 'object' && data && 'code' in data
          ? String((data as { code: string }).code)
          : undefined,
      data,
    });
  }

  return data as T;
}
