import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, setRefreshToken, setToken } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await login(email, password, totp);
      setToken(accessToken);
      setRefreshToken(refreshToken);
      sessionStorage.setItem("efas_access_granted", "1");
      navigate("/");
    } catch (err) {
      setError("Invalid credentials or TOTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="w-full max-w-md bg-bg-surface border border-border-default rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">EFAS Login</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in with email, password, and TOTP.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label>TOTP</label>
            <input
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
      </div>
    </div>
  );
}
