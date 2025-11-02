
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

type Options = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : null;
  if (!res.ok) {
    const message = (data && (data.message || data.detail)) || res.statusText;
    throw new Error(message);
  }
  return data as T;
}
