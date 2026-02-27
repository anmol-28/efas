import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearToken,
  getToken,
  securityProfileStatus,
  vaultCreate,
  vaultDelete,
  vaultList,
  vaultReveal,
  vaultUpdate,
  type VaultEntry
} from "../api";

export default function VaultPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<VaultEntry | null>(null);
  const [revealing, setRevealing] = useState<VaultEntry | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [securityConfigured, setSecurityConfigured] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    platformName: "",
    accountIdentifier: "",
    password: "",
    description: "",
    userPassword: ""
  });

  const [revealForm, setRevealForm] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
    userPassword: ""
  });

  const isEdit = useMemo(() => !!editing, [editing]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    refresh();
  }, [navigate]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [data, status] = await Promise.all([vaultList(), securityProfileStatus()]);
      setEntries(data);
      setSecurityConfigured(status.configured);
    } catch {
      clearToken();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ platformName: "", accountIdentifier: "", password: "", description: "", userPassword: "" });
    setIsCreateOpen(true);
  }

  function openEdit(entry: VaultEntry) {
    setEditing(entry);
    setForm({
      platformName: entry.platformName,
      accountIdentifier: entry.accountIdentifier,
      password: "",
      description: entry.description ?? "",
      userPassword: ""
    });
  }

  function openReveal(entry: VaultEntry) {
    if (securityConfigured === false) {
      navigate("/security-profile");
      return;
    }
    setRevealing(entry);
    setRevealError(null);
    setRevealedPassword(null);
    setRevealForm({ answer1: "", answer2: "", answer3: "", userPassword: "" });
  }

  function closeModal() {
    setIsCreateOpen(false);
    setEditing(null);
  }

  function closeReveal() {
    setRevealing(null);
    setRevealError(null);
    setRevealedPassword(null);
    setCopyMessage(null);
    setToast(null);
    setRevealForm({ answer1: "", answer2: "", answer3: "", userPassword: "" });
  }

  async function onCreateSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await vaultCreate({
        platformName: form.platformName,
        accountIdentifier: form.accountIdentifier,
        password: form.password,
        description: form.description || undefined,
        userPassword: form.userPassword
      });
      closeModal();
      await refresh();
    } catch {
      setError("Failed to create entry.");
    }
  }

  async function onEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);

    try {
      await vaultUpdate(editing.id, {
        platformName: form.platformName,
        accountIdentifier: form.accountIdentifier,
        description: form.description || undefined,
        password: form.password || undefined,
        userPassword: form.userPassword
      });
      closeModal();
      await refresh();
    } catch {
      setError("Failed to update entry.");
    }
  }

  async function onDelete(entry: VaultEntry) {
    const ok = window.confirm(`Delete ${entry.platformName}?`);
    if (!ok) return;

    try {
      await vaultDelete(entry.id);
      await refresh();
    } catch {
      setError("Failed to delete entry.");
    }
  }

  async function onRevealSubmit(e: FormEvent) {
    e.preventDefault();
    if (!revealing) return;

    setRevealError(null);
    setRevealedPassword(null);

    try {
      const res = await vaultReveal(revealing.id, {
        answer1: revealForm.answer1,
        answer2: revealForm.answer2,
        answer3: revealForm.answer3,
        userPassword: revealForm.userPassword
      });
      setRevealedPassword(res.password);
    } catch {
      setRevealError("Failed to reveal password.");
    }
  }

  async function copyPassword() {
    if (!revealedPassword) return;
    await navigator.clipboard.writeText(revealedPassword);
    setCopyMessage("Copied to clipboard.");
    setToast("Copied to clipboard.");
    window.setTimeout(() => {
      setCopyMessage(null);
      setToast(null);
    }, 1500);
  }

  return (
    <div className="core-shell">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-bg-surface border border-border-default px-4 py-2 text-sm text-text-primary shadow-lg">
          {toast}
        </div>
      )}
      <div className="w-full max-w-5xl">
        <div className="core-panel mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Vault</h1>
            <p className="mt-1 text-sm text-text-muted">Manage your stored credentials.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-border-default px-4 py-2 text-sm text-text-primary hover:bg-bg-soft transition"
              onClick={() => {
                clearToken();
                window.location.assign("/login");
              }}
            >
              Logout
            </button>
            <button
              className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primaryHover transition"
              onClick={openCreate}
            >
              Add Entry
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {securityConfigured === false && (
          <div className="mb-4 rounded-md border border-border-default bg-bg-soft px-4 py-3 text-sm text-text-primary">
            Security profile is not configured.{" "}
            <button
              className="text-brand-primary hover:text-brand-primaryHover font-medium"
              onClick={() => navigate("/security-profile")}
            >
              Set it up now
            </button>
            .
          </div>
        )}

        <div className="core-card">
          {loading && <p className="text-sm text-text-muted">Loading...</p>}
          {!loading && entries.length === 0 && (
            <p className="text-sm text-text-muted">No vault entries yet.</p>
          )}
          {!loading && entries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th className="py-2">Platform</th>
                    <th className="py-2">Account</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 font-medium text-text-primary">{entry.platformName}</td>
                      <td className="py-3 text-text-primary">{entry.accountIdentifier}</td>
                      <td className="py-3 text-text-muted">{entry.description || "—"}</td>
                      <td className="py-3 text-right space-x-3">
                        <button
                          className="text-brand-primary hover:text-brand-primaryHover text-sm disabled:opacity-50"
                          onClick={() => openReveal(entry)}
                          disabled={securityConfigured === false}
                        >
                          Reveal
                        </button>
                        <button
                          className="text-brand-primary hover:text-brand-primaryHover text-sm"
                          onClick={() => openEdit(entry)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 text-sm"
                          onClick={() => onDelete(entry)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(isCreateOpen || isEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-bg-surface border border-border-default p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {isEdit ? "Edit Vault Entry" : "Add Vault Entry"}
              </h2>
              <p className="text-sm text-text-muted">
                {isEdit ? "Update details and re-authenticate." : "Store a new credential securely."}
              </p>
            </div>

            <form
              onSubmit={isEdit ? onEditSubmit : onCreateSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label htmlFor="vault-platform">Platform Name</label>
                <input
                  id="vault-platform"
                  className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  value={form.platformName}
                  onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="vault-account">Account Identifier</label>
                <input
                  id="vault-account"
                  className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  value={form.accountIdentifier}
                  onChange={(e) => setForm({ ...form, accountIdentifier: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="vault-password">Password {isEdit && "(leave blank to keep)"}</label>
                <input
                  id="vault-password"
                  type="password"
                  className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!isEdit}
                />
              </div>
              <div>
                <label htmlFor="vault-description">Description</label>
                <input
                  id="vault-description"
                  className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="vault-user-password">Re-auth Password</label>
                <input
                  id="vault-user-password"
                  type="password"
                  className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  value={form.userPassword}
                  onChange={(e) => setForm({ ...form, userPassword: e.target.value })}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-border-default text-text-primary hover:bg-bg-soft transition"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-brand-primary text-white font-medium hover:bg-brand-primaryHover transition"
                >
                  {isEdit ? "Save Changes" : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {revealing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-bg-surface border border-border-default p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Reveal Password</h2>
              <p className="text-sm text-text-muted">Verify your security profile to reveal.</p>
            </div>

            <form onSubmit={onRevealSubmit} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reveal-answer-1">Something You Know — Primary Secret Phrase</label>
                  <input
                    id="reveal-answer-1"
                    className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    value={revealForm.answer1}
                    onChange={(e) => setRevealForm({ ...revealForm, answer1: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reveal-answer-2">Something You Own — Personal Numeric Identifier</label>
                  <input
                    id="reveal-answer-2"
                    className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    value={revealForm.answer2}
                    onChange={(e) => setRevealForm({ ...revealForm, answer2: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reveal-answer-3">Something You Are — Private Identifier String</label>
                  <input
                    id="reveal-answer-3"
                    className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    value={revealForm.answer3}
                    onChange={(e) => setRevealForm({ ...revealForm, answer3: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reveal-user-password">Re-auth Password</label>
                <input
                  id="reveal-user-password"
                  type="password"
                  className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  value={revealForm.userPassword}
                  onChange={(e) => setRevealForm({ ...revealForm, userPassword: e.target.value })}
                  autoComplete="current-password"
                  required
                />
              </div>

              {revealError && <div className="text-sm text-red-600">{revealError}</div>}

              {revealedPassword && (
                <div className="rounded-md border border-border-default bg-bg-soft p-3 text-sm">
                  <div className="mb-2 text-text-muted">Password</div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="break-all text-text-primary">{revealedPassword}</code>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="px-3 py-1 rounded-md border border-border-default text-text-primary hover:bg-bg-soft-2 transition"
                    >
                      Copy
                    </button>
                  </div>
                  {copyMessage && <div className="mt-2 text-xs text-text-muted">{copyMessage}</div>}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-border-default text-text-primary hover:bg-bg-soft transition"
                  onClick={closeReveal}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-brand-primary text-white font-medium hover:bg-brand-primaryHover transition"
                >
                  Reveal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
