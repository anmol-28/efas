import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { securityProfileSetup } from "../api";

export default function SecurityProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    answer1: "",
    answer2: "",
    answer3: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await securityProfileSetup(form);
      navigate("/");
    } catch {
      setError("Failed to setup security profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="core-shell">
      <div className="core-panel">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Security Profile</h1>
          <p className="mt-1 text-sm text-text-muted">
            Set your 3 security answers. You will need these to reveal passwords.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label htmlFor="sp-answer-1">Something You Know — Primary Secret Phrase</label>
            <input
              id="sp-answer-1"
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={form.answer1}
              onChange={(e) => setForm({ ...form, answer1: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="sp-answer-2">Something You Own — Personal Numeric Identifier</label>
            <input
              id="sp-answer-2"
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={form.answer2}
              onChange={(e) => setForm({ ...form, answer2: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="sp-answer-3">Something You Are — Private Identifier String</label>
            <input
              id="sp-answer-3"
              className="w-full px-3 py-2 rounded-md border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={form.answer3}
              onChange={(e) => setForm({ ...form, answer3: e.target.value })}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-brand-primary text-white font-medium hover:bg-brand-primaryHover transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Security Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
