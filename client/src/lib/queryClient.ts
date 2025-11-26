import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {};
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle token expiration
  if (res.status === 403) {
    try {
      const errorData = await res.json().catch(() => ({}));
      if (errorData.code === 'INVALID_TOKEN') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } catch {
      // Ignore JSON parsing errors
    }
    // For 403/401 errors, return the response without throwing
    // This allows components to handle authentication errors gracefully
    // These errors won't appear in console as failed requests
    return res;
  }

  // Only throw for other errors (not 401/403)
  if (res.status !== 401 && res.status !== 403) {
    await throwIfResNotOk(res);
  }
  return res;
}
