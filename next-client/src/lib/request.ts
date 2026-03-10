// simple fetch wrapper for frontend <-> backend communication
// usage: import { request } from '../lib/request';

// In dev and production the Next.js rewrite in next.config.ts forwards
// /api/* → NEXT_PUBLIC_API_BASE/*, avoiding CORS entirely.
const API_BASE = '/api';
const DEBUG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG91dGxvb2suY29tIiwic3ViIjoiMDFLSzJGTUhGNjE2NlpQVEFONjhHWEpWTjYiLCJpYXQiOjE3NzI4NDM0NjIsImV4cCI6MTc3NTQzNTQ2Mn0.TkgUqAQmG5iw-vRZPoW69iy0fOI6dDnspPnTlC6rw7o';

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

  const init: RequestInit = {
    method,
    ...rest,
    headers: {
      ...(skipDefaults ? {} : {
        'Authorization': `Bearer ${DEBUG_TOKEN}`,
      }),
      'Content-Type': 'application/json',
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

/** Like request(), but returns a Blob – use for CSV / file download endpoints. */
export async function requestBlob(
  path: string,
  options: RequestOptions = {}
): Promise<Blob> {
  const url = `${API_BASE}${path}`;
  const { skipDefaults, json, method = 'GET', headers = {}, ...rest } = options;

  const init: RequestInit = {
    method,
    ...rest,
    headers: {
      ...(skipDefaults ? {} : { 'Authorization': `Bearer ${DEBUG_TOKEN}` }),
      ...headers,
    },
    credentials: skipDefaults ? undefined : 'include',
  };

  if (json !== undefined) init.body = JSON.stringify(json);

  const res = await fetch(url, init);
  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status} ${res.statusText}`);
    const err = new Error(msg || `HTTP ${res.status} ${res.statusText}`);
    // @ts-ignore
    err.status = res.status;
    throw err;
  }
  return res.blob();
}
