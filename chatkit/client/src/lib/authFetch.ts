import { useAppConfig } from "../store/appConfig";

const TOKEN_KEY = "hermes_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Drop-in replacement for `fetch` that automatically attaches
 * the JWT `Authorization: Bearer` header.
 *
 * Usage:
 *   const res = await authFetch("/api/projects");
 *   const res = await authFetch("/api/projects", { method: "DELETE" });
 */
export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const { getApiUrl } = useAppConfig.getState();
  const url = path.startsWith("http") ? path : getApiUrl(path);
  const token = getToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  // Auto-logout on 401
  if (res.status === 401) {
    clearToken();
  }

  return res;
}
