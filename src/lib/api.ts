// API helper for Reader's Rendezvous Full-Stack Communication

const API_BASE = "/api";

export function getStoredToken(): string | null {
  return localStorage.getItem("rendezvous_token");
}

export function setStoredToken(token: string) {
  localStorage.setItem("rendezvous_token", token);
}

export function removeStoredToken() {
  localStorage.removeItem("rendezvous_token");
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  signup: (body: any) => request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),

  // Stories
  getStories: () => request("/stories"),
  getUserStories: () => request("/stories/me"),
  createStory: (body: any) => request("/stories", { method: "POST", body: JSON.stringify(body) }),

  // Connections
  getConnections: () => request("/connections"),
  
  // Messages
  getMessages: (connectionId: string) => request(`/connections/${connectionId}/messages`),
  sendMessage: (connectionId: string, text: string) => 
    request(`/connections/${connectionId}/messages`, { 
      method: "POST", 
      body: JSON.stringify({ text }) 
    }),
};
