import { Navigate } from "react-router-dom";
import { getAuthToken } from "../../services/api";

export function RequireAuth({ children }) {
  const token = getAuthToken();

  if (!token) {
    const requestedPath = `${window.location.pathname}${window.location.search || ""}`;
    return <Navigate to={`/login?next=${encodeURIComponent(requestedPath)}`} replace />;
  }

  return children;
}

export function ProtectedRoute({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
