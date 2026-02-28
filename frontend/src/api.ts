const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export type VaultEntry = {
  id: string;
  platformName: string;
  accountIdentifier: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export function getToken() {
  return localStorage.getItem("efas_token");
}

export function setToken(token: string) {
  localStorage.setItem("efas_token", token);
}

export function clearTokens() {
  localStorage.removeItem("efas_token");
}

function handleUnauthorized() {
  clearTokens();
  window.location.assign("/login");
}

async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { accessToken: string };
  setToken(data.accessToken);
  return true;
}

async function apiFetch(input: RequestInfo, init: RequestInit = {}, auth = true) {
  const headers = new Headers(init.headers);
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers, credentials: "include" });
  if (!auth || res.status !== 401) return res;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    handleUnauthorized();
    return res;
  }

  const retryHeaders = new Headers(init.headers);
  const token = getToken();
  if (token) retryHeaders.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers: retryHeaders, credentials: "include" });
}

export async function login(email: string, password: string, totp: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, totp }),
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  return data as { accessToken: string };
}

export async function me() {
  const res = await apiFetch(`${API_BASE}/auth/me`);

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return (await res.json()) as { id: string; email: string };
}

export async function securityProfileStatus() {
  const res = await apiFetch(`${API_BASE}/security-profile/status`);

  if (!res.ok) {
    throw new Error("Failed to load security profile status");
  }

  return (await res.json()) as { configured: boolean; enabled: boolean };
}

export async function securityProfileToggle(enabled: boolean) {
  const res = await apiFetch(`${API_BASE}/security-profile/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled })
  });

  if (!res.ok) {
    throw new Error("Failed to update security profile setting");
  }

  return (await res.json()) as { ok: boolean; enabled: boolean };
}

export async function securityProfileSetup(input: {
  answer1: string;
  answer2: string;
  answer3: string;
}) {
  const res = await apiFetch(`${API_BASE}/security-profile/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    throw new Error("Failed to setup security profile");
  }

  return (await res.json()) as { ok: boolean };
}

export async function vaultList() {
  const res = await apiFetch(`${API_BASE}/vault`);

  if (!res.ok) {
    throw new Error("Failed to load vault");
  }

  return (await res.json()) as VaultEntry[];
}

export async function vaultCreate(input: {
  platformName: string;
  accountIdentifier: string;
  password: string;
  description?: string;
  userPassword: string;
}) {
  const res = await apiFetch(`${API_BASE}/vault`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    throw new Error("Failed to create entry");
  }

  return (await res.json()) as VaultEntry;
}

export async function vaultUpdate(
  id: string,
  input: {
    platformName?: string;
    accountIdentifier?: string;
    password?: string;
    description?: string;
    userPassword: string;
  }
) {
  const res = await apiFetch(`${API_BASE}/vault/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    throw new Error("Failed to update entry");
  }

  return (await res.json()) as VaultEntry;
}

export async function vaultDelete(id: string) {
  const res = await apiFetch(`${API_BASE}/vault/${id}`, { method: "DELETE" });

  if (!res.ok) {
    throw new Error("Failed to delete entry");
  }

  return (await res.json()) as { ok: boolean };
}

export async function vaultReveal(
  id: string,
  input: {
    answer1?: string;
    answer2?: string;
    answer3?: string;
    userPassword: string;
  }
) {
  const res = await apiFetch(`${API_BASE}/vault/${id}/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    throw new Error("Failed to reveal password");
  }

  return (await res.json()) as { password: string };
}

export async function logout() {
  try {
    await apiFetch(
      `${API_BASE}/auth/logout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      true
    );
  } finally {
    clearTokens();
  }
}
