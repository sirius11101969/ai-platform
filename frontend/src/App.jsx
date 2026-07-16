import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { markAs6DesignSystemReady } from "./utils/as6RuntimeTracer";
import { getAuthToken, getStoredUser } from "./services/api";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import {
  AS6PublicLivingBlogPage,
  AS6PublicLivingHomePage,
  AS6PublicLivingInfoPage,
} from "./pages/AS6PublicLivingWebsite.jsx";
import LivingSpacePreviewPage from "./living/preview/LivingSpacePreviewPage.jsx";
import LivingProductPreviewPage from "./living/product-v1/LivingProductPreviewPage.jsx";
import "./styles.css";
import "./theme/as6Theme.css";

const AuthContext = createContext({ token: null, user: null, isAuthenticated: false });

const LEGACY_PLATFORM_ROUTES = [
  "/marketplace",
  "/crm",
  "/as6-crm",
  "/crm-v2",
  "/as6-os",
  "/crm-workspace",
  "/as6-workspace",
  "/dashboard",
  "/dashboard/revenue",
  "/business-home",
  "/ai-workers",
  "/followups",
  "/priority-inbox",
  "/pipeline-copilot",
  "/ai-manager-dashboard",
  "/ai-voice-outreach",
  "/ai-realtime-voice",
  "/ai-live-streaming",
  "/ai-revenue-intelligence",
  "/ai-revenue-engine",
  "/ai-revenue-engine",
  "/ai-approval-center",
  "/ai-execution-center",
  "/ai-workforce-center",
  "/ai-executive-brain",
  "/ai-executive-dashboard",
  "/ai-company-simulation",
  "/ai-strategic-planning",
  "/ai/strategic-planning",
  "/ai-enterprise-coordination",
  "/ai/enterprise-coordination",
  "/ai-organizational-memory",
  "/ai/organizational-memory",
  "/ai-system-health-center",
  "/ai/system-health",
  "/ai/revenue-engine",
  "/ai/workforce",
  "/ai/approval-center",
  "/ai-enterprise-command-center",
  "/command-center",
];

function getAuthState() {
  const token = getAuthToken();
  return { token, user: getStoredUser(), isAuthenticated: Boolean(token) };
}

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getAuthState);

  useEffect(() => {
    markAs6DesignSystemReady({ route: window.location.pathname });

    function syncAuthState(event) {
      if (event?.type === "ai-platform-auth-updated" && event.detail?.token) {
        setAuthState({ token: event.detail.token, user: event.detail.user || null, isAuthenticated: true });
        return;
      }
      if (event?.type === "ai-platform-auth-cleared") {
        setAuthState({ token: null, user: null, isAuthenticated: false });
        return;
      }
      setAuthState(getAuthState());
    }

    window.addEventListener("ai-platform-auth-updated", syncAuthState);
    window.addEventListener("ai-platform-auth-cleared", syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener("ai-platform-auth-updated", syncAuthState);
      window.removeEventListener("ai-platform-auth-cleared", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const value = useMemo(() => authState, [authState]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function RequirePrimaryAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return children;
  const requestedPath = `${window.location.pathname}${window.location.search || ""}`;
  return <Navigate to={`/login?next=${encodeURIComponent(requestedPath)}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AS6PublicLivingHomePage />} />
          <Route path="/blog" element={<AS6PublicLivingBlogPage />} />
          <Route path="/blog/:slug" element={<AS6PublicLivingBlogPage />} />
          <Route path="/docs" element={<AS6PublicLivingInfoPage type="docs" />} />
          <Route path="/pricing" element={<AS6PublicLivingInfoPage type="pricing" />} />
          <Route path="/about" element={<AS6PublicLivingInfoPage type="about" />} />
          <Route path="/contact" element={<AS6PublicLivingInfoPage type="contact" />} />

          <Route path="/app" element={<RequirePrimaryAuth><LivingProductPreviewPage /></RequirePrimaryAuth>} />
          <Route path="/app/*" element={<RequirePrimaryAuth><LivingProductPreviewPage /></RequirePrimaryAuth>} />
          <Route path="/preview/living" element={<LivingProductPreviewPage />} />
          <Route path="/as6-living-preview" element={<LivingSpacePreviewPage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />

          {LEGACY_PLATFORM_ROUTES.map((path) => (
            <Route key={path} path={path} element={<Navigate to="/app" replace />} />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
