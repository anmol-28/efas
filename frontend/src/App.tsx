import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { me } from "./api";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import VaultPage from "./pages/Vault";
import SecurityProfilePage from "./pages/SecurityProfile";
import { initTheme } from "./lib/theme";

export default function App() {
  const [authState, setAuthState] = useState<"checking" | "authed" | "guest">("checking");

  useEffect(() => {
    initTheme();
    const path = window.location.pathname;
    if (path === "/login" || path === "/signin") {
      setAuthState("guest");
      return;
    }

    me()
      .then(() => setAuthState("authed"))
      .catch(() => setAuthState("guest"));
  }, []);

  if (authState === "checking") {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/" element={authState === "authed" ? <VaultPage /> : <LoginPage />} />
      <Route
        path="/security-profile"
        element={
          authState === "authed" ? <SecurityProfilePage /> : <LoginPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          authState === "authed" ? <DashboardPage /> : <LoginPage />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
