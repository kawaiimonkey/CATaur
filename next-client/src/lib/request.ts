// simple fetch wrapper for frontend <-> backend communication
// usage: import { request } from '../lib/request';

// In dev and production the Next.js rewrite in next.config.ts forwards
// /api/* → NEXT_PUBLIC_API_BASE/*, avoiding CORS entirely.
const API_BASE = '/api';

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  /** if set to true the helper will not attach the default JSON headers
   * or send credentials.  Useful for public endpoints or file uploads. */
  skipDefaults?: boolean;
  /** object payload that will be JSON.stringified automatically */
  json?: any;
  /** HTTP method, defaults to 'GET' */
  method?: string;
};

export async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { skipDefaults, json, method = 'GET', headers = {}, ...rest } = options;

  // TODO: remove once login is wired up – replace with real token from auth store
  const DEBUG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG91dGxvb2suY29tIiwic3ViIjoiMDFLSzJGTUhGNjE2NlpQVEFONjhHWEpWTjYiLCJpYXQiOjE3NzI4Mzg0MDEsImV4cCI6MTc3Mjg0MjAwMX0.Hynh-_yB42QDLC0wGk9SDuM6GxSUXPTl6my4-JZpcZE';

  const init: RequestInit = {
    method,
    ...rest,
    headers: {
      ...(skipDefaults ? {} : {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEBUG_TOKEN}`,
      }),
      ...headers,
    },
    credentials: skipDefaults ? undefined : 'include',
  };

  if (json !== undefined) {
    init.body = JSON.stringify(json);
  }

  const res = await fetch(url, init);

  let data: any;
  try {
    data = await res.json();
  } catch (e) {
    // not JSON, swallow
    data = null;
  }

  if (!res.ok) {
    const err = new Error(
      data?.message || `HTTP ${res.status} ${res.statusText}`
    );
    // @ts-ignore
    err.status = res.status;
    throw err;
  }

  return data as T;
}
