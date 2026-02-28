import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { getTheme, toggleTheme } from "../lib/theme";
import { FiMoon, FiSun } from "react-icons/fi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getTheme());

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, totp);
      sessionStorage.setItem("efas_access_granted", "1");
      navigate("/", { replace: true });
      window.location.assign("/");
    } catch (err) {
      setError("Invalid credentials or TOTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="w-full max-w-md bg-bg-surface border border-border-default rounded-xl p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <img src="/efas-logo.png" alt="EFAS logo" className="h-5 w-5 object-contain" />
            EFAS
          </div>
          <button
            className="rounded-md border border-border-default px-3 py-2 text-text-primary hover:bg-bg-soft transition"
            onClick={() => setTheme(toggleTheme())}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">EFAS Login</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in with email, password, and TOTP.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="login-totp">TOTP</label>
            <input
              id="login-totp"
              type="text"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-brand-primary text-white font-medium hover:bg-brand-primaryHover transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-5 rounded-lg border border-border-default bg-bg-soft px-3 py-2 text-xs text-text-muted">
          Need a vault ID? Reach me at{" "}
          <a
            href="mailto:n3o.th1.28@gmail.com"
            className="font-semibold text-brand-primary hover:text-brand-primaryHover transition"
          >
            n3o.th1.28@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
