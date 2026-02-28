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

export function clearToken() {
  localStorage.removeItem("efas_token");
}

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export async function login(email: string, password: string, totp: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, totp })
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  return data as { accessToken: string };
}

export async function me() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return (await res.json()) as { id: string; email: string };
}

export async function securityProfileStatus() {
  const res = await fetch(`${API_BASE}/security-profile/status`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Failed to load security profile status");
  }

  return (await res.json()) as { configured: boolean; enabled: boolean };
}

export async function securityProfileToggle(enabled: boolean) {
  const res = await fetch(`${API_BASE}/security-profile/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
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
  const res = await fetch(`${API_BASE}/security-profile/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    throw new Error("Failed to setup security profile");
  }

  return (await res.json()) as { ok: boolean };
}

export async function vaultList() {
  const res = await fetch(`${API_BASE}/vault`, {
    headers: authHeaders()
  });

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
  const res = await fetch(`${API_BASE}/vault`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
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
  const res = await fetch(`${API_BASE}/vault/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    throw new Error("Failed to update entry");
  }

  return (await res.json()) as VaultEntry;
}

export async function vaultDelete(id: string) {
  const res = await fetch(`${API_BASE}/vault/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

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
  const res = await fetch(`${API_BASE}/vault/${id}/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    throw new Error("Failed to reveal password");
  }

  return (await res.json()) as { password: string };
}
