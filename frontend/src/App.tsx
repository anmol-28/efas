import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./api";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import VaultPage from "./pages/Vault";
import SecurityProfilePage from "./pages/SecurityProfile";

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={getToken() ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <VaultPage />
          </RequireAuth>
        }
      />
      <Route
        path="/security-profile"
        element={
          <RequireAuth>
            <SecurityProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
