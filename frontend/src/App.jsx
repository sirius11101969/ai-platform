import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";
import { ProtectedLayout } from "./components/AppShell";
import LandingPage from "./pages/LandingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import DashboardPage from "./pages/DashboardPage";
import CRMPage from "./pages/CRMPage";
import { getAuthToken } from "./services/api";

function RequireAuth() {
  const isAuthenticated = Boolean(getAuthToken());
  return isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/crm" element={<CRMPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
