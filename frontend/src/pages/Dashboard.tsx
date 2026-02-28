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
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>EFAS Dashboard</h1>
      {loading && <p>Loading...</p>}
      {!loading && email && (
        <p>
          Logged in as <strong>{email}</strong>
        </p>
      )}
    </div>
  );
}
