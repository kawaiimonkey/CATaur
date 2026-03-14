type RequestOptions = RequestInit & { skipAuth?: boolean };

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { headers, skipAuth, ...rest } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(skipAuth || !token ? {} : { 'Authorization': `Bearer ${token}` }),
      ...headers,
    },
    ...rest,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as any)?.message || "Request failed";
    throw new Error(message);
  }
  return data as T;
}
