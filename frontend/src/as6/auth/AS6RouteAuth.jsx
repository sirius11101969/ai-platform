import { Navigate } from "react-router-dom";

export function RequireAuth({ children }) {
  const token = localStorage.getItem("as6-token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function ProtectedRoute({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
