import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearTokens,
  getToken,
  logout,
  securityProfileStatus,
  securityProfileToggle,
  vaultCreate,
  vaultDelete,
  vaultList,
  vaultReveal,
  vaultUpdate,
  type VaultEntry
} from "../api";
import * as SI from "react-icons/si";
import { FiGlobe } from "react-icons/fi";

type PlatformOption = { label: string; value: string; icon: string };

const PLATFORM_OPTIONS: PlatformOption[] = [
  { label: "Gmail", value: "gmail", icon: "SiGmail" },
  { label: "Google", value: "google", icon: "SiGoogle" },
  { label: "GitHub", value: "github", icon: "SiGithub" },
  { label: "AWS", value: "aws", icon: "SiAmazonwebservices" },
  { label: "Amazon", value: "amazon", icon: "SiAmazon" },
  { label: "Outlook", value: "outlook", icon: "SiMicrosoftoutlook" },
  { label: "Teams", value: "teams", icon: "SiMicrosoftteams" },
  { label: "LinkedIn", value: "linkedin", icon: "SiLinkedin" },
  { label: "Instagram", value: "instagram", icon: "SiInstagram" },
  { label: "Facebook", value: "facebook", icon: "SiFacebook" },
  { label: "X (Twitter)", value: "x", icon: "SiX" },
  { label: "Discord", value: "discord", icon: "SiDiscord" },
  { label: "Telegram", value: "telegram", icon: "SiTelegram" },
  { label: "WhatsApp", value: "whatsapp", icon: "SiWhatsapp" },
  { label: "Reddit", value: "reddit", icon: "SiReddit" },
  { label: "TikTok", value: "tiktok", icon: "SiTiktok" },
  { label: "YouTube", value: "youtube", icon: "SiYoutube" },
  { label: "Slack", value: "slack", icon: "SiSlack" },
  { label: "Notion", value: "notion", icon: "SiNotion" },
  { label: "Dropbox", value: "dropbox", icon: "SiDropbox" },
  { label: "Zoom", value: "zoom", icon: "SiZoom" },
  { label: "PayPal", value: "paypal", icon: "SiPaypal" },
  { label: "Stripe", value: "stripe", icon: "SiStripe" },
  { label: "Apple", value: "apple", icon: "SiApple" },
  { label: "Spotify", value: "spotify", icon: "SiSpotify" },
  { label: "Netflix", value: "netflix", icon: "SiNetflix" },
  { label: "GitLab", value: "gitlab", icon: "SiGitlab" },
  { label: "Bitbucket", value: "bitbucket", icon: "SiBitbucket" },
  { label: "Atlassian", value: "atlassian", icon: "SiAtlassian" },
  { label: "Jira", value: "jira", icon: "SiJira" },
  { label: "Confluence", value: "confluence", icon: "SiConfluence" },
  { label: "Figma", value: "figma", icon: "SiFigma" },
  { label: "Trello", value: "trello", icon: "SiTrello" },
  { label: "Airtable", value: "airtable", icon: "SiAirtable" },
  { label: "Asana", value: "asana", icon: "SiAsana" },
  { label: "Salesforce", value: "salesforce", icon: "SiSalesforce" },
  { label: "Shopify", value: "shopify", icon: "SiShopify" },
  { label: "Vercel", value: "vercel", icon: "SiVercel" },
  { label: "Netlify", value: "netlify", icon: "SiNetlify" },
  { label: "Cloudflare", value: "cloudflare", icon: "SiCloudflare" },
  { label: "Docker", value: "docker", icon: "SiDocker" },
  { label: "Kubernetes", value: "kubernetes", icon: "SiKubernetes" },
  { label: "DigitalOcean", value: "digitalocean", icon: "SiDigitalocean" },
  { label: "Firebase", value: "firebase", icon: "SiFirebase" },
  { label: "Supabase", value: "supabase", icon: "SiSupabase" },
  { label: "OpenAI", value: "openai", icon: "SiOpenai" }
];

function normalizePlatform(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getPlatformOption(value: string) {
  const normalized = normalizePlatform(value);
  return PLATFORM_OPTIONS.find(
    (p) =>
      normalizePlatform(p.value) === normalized || normalizePlatform(p.label) === normalized
  );
}

function renderIcon(name: string | undefined) {
  const Icon = name ? (SI as Record<string, React.ComponentType>)[name] : undefined;
  if (!Icon) return <FiGlobe />;
  return <Icon />;
}

function detectPlatformFromIdentifier(identifier: string) {
  const raw = identifier.trim().toLowerCase();
  if (!raw) return null;
  const domain = raw.includes("@") ? raw.split("@").pop() ?? "" : raw;

  if (domain.includes("gmail") || domain.includes("googlemail")) return "Gmail";
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live.com")) {
    return "Outlook";
  }
  if (domain.includes("github")) return "GitHub";
  if (domain.includes("gitlab")) return "GitLab";
  if (domain.includes("bitbucket")) return "Bitbucket";
  if (domain.includes("amazonaws") || domain.includes("aws")) return "AWS";
  if (domain.includes("amazon.")) return "Amazon";
  if (domain.includes("linkedin")) return "LinkedIn";
  if (domain.includes("instagram")) return "Instagram";
  if (domain.includes("facebook")) return "Facebook";
  if (domain.includes("twitter") || domain.includes("x.com")) return "X (Twitter)";
  if (domain.includes("discord")) return "Discord";
  if (domain.includes("telegram")) return "Telegram";
  if (domain.includes("whatsapp")) return "WhatsApp";
  if (domain.includes("reddit")) return "Reddit";
  if (domain.includes("tiktok")) return "TikTok";
  if (domain.includes("youtube")) return "YouTube";
  if (domain.includes("slack")) return "Slack";
  if (domain.includes("notion")) return "Notion";
  if (domain.includes("dropbox")) return "Dropbox";
  if (domain.includes("zoom")) return "Zoom";
  if (domain.includes("paypal")) return "PayPal";
  if (domain.includes("stripe")) return "Stripe";
  if (domain.includes("apple")) return "Apple";
  if (domain.includes("spotify")) return "Spotify";
  if (domain.includes("netflix")) return "Netflix";
  if (domain.includes("atlassian")) return "Atlassian";
  if (domain.includes("jira")) return "Jira";
  if (domain.includes("confluence")) return "Confluence";
  if (domain.includes("figma")) return "Figma";
  if (domain.includes("trello")) return "Trello";
  if (domain.includes("airtable")) return "Airtable";
  if (domain.includes("asana")) return "Asana";
  if (domain.includes("salesforce")) return "Salesforce";
  if (domain.includes("shopify")) return "Shopify";
  if (domain.includes("vercel")) return "Vercel";
  if (domain.includes("netlify")) return "Netlify";
  if (domain.includes("cloudflare")) return "Cloudflare";
  if (domain.includes("docker")) return "Docker";
  if (domain.includes("kubernetes")) return "Kubernetes";
  if (domain.includes("digitalocean")) return "DigitalOcean";
  if (domain.includes("firebase")) return "Firebase";
  if (domain.includes("supabase")) return "Supabase";
  if (domain.includes("openai")) return "OpenAI";

  return null;
}

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
  const [securityEnabled, setSecurityEnabled] = useState<boolean | null>(null);
  const [showAccessGranted, setShowAccessGranted] = useState(false);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<VaultEntry | null>(null);
  const pageSize = 7;

  const [form, setForm] = useState({
    platformName: "",
    accountIdentifier: "",
    password: "",
    description: "",
    userPassword: ""
  });

  const [platformInput, setPlatformInput] = useState<string>("");
  const [platformTouched, setPlatformTouched] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [recentPlatforms, setRecentPlatforms] = useState<string[]>([]);

  const [revealForm, setRevealForm] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
    userPassword: ""
  });

  const isEdit = useMemo(() => !!editing, [editing]);
  const detectedPlatform = useMemo(
    () => detectPlatformFromIdentifier(form.accountIdentifier),
    [form.accountIdentifier]
  );

  const filteredPlatforms = useMemo(() => {
    const query = normalizePlatform(platformInput);
    if (!query) return PLATFORM_OPTIONS.slice(0, 8);
    return PLATFORM_OPTIONS.filter((p) => {
      const label = normalizePlatform(p.label);
      const value = normalizePlatform(p.value);
      return label.includes(query) || value.includes(query);
    }).slice(0, 8);
  }, [platformInput]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const show = sessionStorage.getItem("efas_access_granted") === "1";
    if (show) {
      sessionStorage.removeItem("efas_access_granted");
      setShowAccessGranted(true);
      window.setTimeout(() => setShowAccessGranted(false), 1400);
    }

    refresh();
  }, [navigate]);

  useEffect(() => {
    const raw = localStorage.getItem("efas_recent_platforms");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentPlatforms(parsed.filter((v) => typeof v === "string"));
      }
    } catch {
      setRecentPlatforms([]);
    }
  }, []);

  useEffect(() => {
    if (platformTouched || platformInput.trim()) return;
    if (detectedPlatform) {
      setPlatformInput(detectedPlatform);
    }
  }, [detectedPlatform, platformInput, platformTouched]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [data, status] = await Promise.all([vaultList(), securityProfileStatus()]);
      setEntries(data);
      setSecurityConfigured(status.configured);
      setSecurityEnabled(status.enabled);
      setPage(1);
    } catch {
      clearTokens();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ platformName: "", accountIdentifier: "", password: "", description: "", userPassword: "" });
    setPlatformInput("");
    setPlatformTouched(false);
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

    setPlatformInput(entry.platformName);
    setPlatformTouched(false);
  }

  function openReveal(entry: VaultEntry) {
    if (securityEnabled !== false && securityConfigured === false) {
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
      const platformName = platformInput.trim();
      if (!platformName) {
        setError("Please select or type a platform.");
        return;
      }
      await vaultCreate({
        platformName,
        accountIdentifier: form.accountIdentifier,
        password: form.password,
        description: form.description || undefined,
        userPassword: form.userPassword
      });
      closeModal();
      await refresh();
      setPage(1);
      pushRecentPlatform(platformName);
    } catch {
      setError("Failed to create entry.");
    }
  }

  async function onEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);

    try {
      const platformName = platformInput.trim();
      if (!platformName) {
        setError("Please select or type a platform.");
        return;
      }
      await vaultUpdate(editing.id, {
        platformName,
        accountIdentifier: form.accountIdentifier,
        description: form.description || undefined,
        password: form.password || undefined,
        userPassword: form.userPassword
      });
      closeModal();
      await refresh();
      pushRecentPlatform(platformName);
    } catch {
      setError("Failed to update entry.");
    }
  }

  async function onDelete(entry: VaultEntry) {
    try {
      await vaultDelete(entry.id);
      await refresh();
      setPage(1);
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
        answer1: securityEnabled !== false ? revealForm.answer1 : undefined,
        answer2: securityEnabled !== false ? revealForm.answer2 : undefined,
        answer3: securityEnabled !== false ? revealForm.answer3 : undefined,
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

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const pagedEntries = entries.slice((page - 1) * pageSize, page * pageSize);

  function pushRecentPlatform(platform: string) {
    const next = [platform, ...recentPlatforms.filter((p) => p !== platform)].slice(0, 6);
    setRecentPlatforms(next);
    localStorage.setItem("efas_recent_platforms", JSON.stringify(next));
  }

  return (
    <div className="min-h-screen w-full px-6 py-6">
      {showAccessGranted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <div className="absolute inset-0 scanlines" />
          <div className="relative">
            <div className="text-2xl md:text-3xl font-semibold access-granted">
              &gt; Access Granted
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-bg-surface border border-border-default px-4 py-2 text-sm text-text-primary shadow-lg">
          {toast}
        </div>
      )}
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between rounded-xl border border-border-default bg-bg-surface/90 px-6 py-4 shadow-sm glass-panel">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-primary-soft border border-border-default flex items-center justify-center text-sm font-semibold text-brand-secondary">
                EF
              </div>
              <div>
                <div className="text-lg font-semibold text-text-primary">EFAS</div>
                <div className="text-xs text-text-muted">Secure vault</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-border-default px-4 py-2 text-sm text-text-primary hover:bg-bg-soft transition"
              onClick={async () => {
                await logout();
                window.location.assign("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Vault</h1>
            <p className="mt-1 text-sm text-text-muted">Manage your stored credentials.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={securityEnabled !== false}
                onChange={async (e) => {
                  const next = e.target.checked;
                  try {
                    const res = await securityProfileToggle(next);
                    setSecurityEnabled(res.enabled);
                  } catch {
                    setToast("Failed to update security setting.");
                    window.setTimeout(() => setToast(null), 1500);
                  }
                }}
              />
              Security profile
            </label>
            <button className="btn-neo" onClick={openCreate}>
              Add Entry
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {securityEnabled === false && (
          <div className="mb-4 rounded-md border border-border-default bg-bg-soft px-4 py-3 text-sm text-text-primary">
            Security profile is turned off. Reveal will only require your re-auth password.
          </div>
        )}
        {securityEnabled !== false && securityConfigured === false && (
          <div className="mb-4 rounded-md border border-border-default bg-bg-soft px-4 py-3 text-sm text-text-primary">
            Security profile is not configured. {""}
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
                    <th className="py-2">Username</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {pagedEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {renderIcon(getPlatformOption(entry.platformName)?.icon)}
                          </span>
                          <span>{entry.platformName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-text-primary">{entry.accountIdentifier}</td>
                      <td className="py-3 text-text-muted">{entry.description || "—"}</td>
                      <td className="py-3 text-right space-x-3">
                        <button
                          className="text-brand-primary hover:text-brand-primaryHover text-sm disabled:opacity-50"
                          onClick={() => openReveal(entry)}
                          disabled={securityEnabled !== false && securityConfigured === false}
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
                          onClick={() => setDeleting(entry)}
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
          {!loading && entries.length > pageSize && (
            <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border border-border-default px-3 py-1 text-text-primary hover:bg-bg-soft transition disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <button
                  className="rounded-md border border-border-default px-3 py-1 text-text-primary hover:bg-bg-soft transition disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
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
                <label htmlFor="vault-platform">Platform</label>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md border border-border-default bg-bg-soft text-base">
                      {renderIcon(getPlatformOption(platformInput)?.icon)}
                    </div>
                    <input
                      id="vault-platform"
                      className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      placeholder="Search or type a platform"
                      value={platformInput}
                      onChange={(e) => {
                        setPlatformInput(e.target.value);
                        setPlatformTouched(true);
                        setPlatformOpen(true);
                      }}
                      onFocus={() => setPlatformOpen(true)}
                      onBlur={() => window.setTimeout(() => setPlatformOpen(false), 120)}
                      required
                    />
                  </div>
                  {platformOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-md border border-border-default bg-bg-surface shadow-lg">
                      {recentPlatforms.length > 0 && (
                        <div className="border-b border-border-default px-3 py-2 text-xs text-text-muted">
                          Recent
                          <div className="mt-2 flex flex-wrap gap-2">
                            {recentPlatforms.map((p) => (
                              <button
                                type="button"
                                key={p}
                                className="rounded-full border border-border-default px-3 py-1 text-xs text-text-primary hover:bg-bg-soft transition"
                                onMouseDown={() => {
                                  setPlatformInput(p);
                                  setPlatformOpen(false);
                                }}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="max-h-56 overflow-auto p-2">
                        {filteredPlatforms.length === 0 && (
                          <div className="px-3 py-2 text-sm text-text-muted">
                            No matches. Keep typing to add a custom platform.
                          </div>
                        )}
                        {filteredPlatforms.map((p) => (
                          <button
                            type="button"
                            key={p.value}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-primary hover:bg-bg-soft transition"
                            onMouseDown={() => {
                              setPlatformInput(p.label);
                              setPlatformOpen(false);
                            }}
                          >
                            <span className="text-base">{renderIcon(p.icon)}</span>
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {detectedPlatform && detectedPlatform !== platformInput && !platformTouched && (
                  <div className="mt-2 text-xs text-text-muted">
                    Detected from username: {detectedPlatform}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="vault-account">Username</label>
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
              <p className="text-sm text-text-muted">
                {securityEnabled === false
                  ? "Re-auth to reveal your password."
                  : "Verify your security profile to reveal."}
              </p>
            </div>

            <form onSubmit={onRevealSubmit} className="space-y-4" autoComplete="off">
              {securityEnabled !== false && (
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
              )}

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

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-bg-surface border border-border-default p-6 shadow-lg">
            <div className="mb-3 text-lg font-semibold text-text-primary">Delete entry?</div>
            <p className="text-sm text-text-muted">
              This will permanently remove <span className="font-medium text-text-primary">{deleting.platformName}</span>.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-border-default text-text-primary hover:bg-bg-soft transition"
                onClick={() => setDeleting(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition"
                onClick={async () => {
                  const target = deleting;
                  setDeleting(null);
                  await onDelete(target);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
