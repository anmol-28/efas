import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me, clearTokens, getToken } from "../api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    me()
      .then((data) => setEmail(data.email))
      .catch(() => {
        clearTokens();
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="mx-auto mt-10 max-w-xl font-sans text-text-primary">
      <h1 className="text-xl font-semibold">EFAS Dashboard</h1>
      {loading && <p className="text-sm text-text-muted">Loading...</p>}
      {!loading && email && (
        <p className="text-sm">
          Logged in as <strong>{email}</strong>
        </p>
      )}
    </div>
  );
}
