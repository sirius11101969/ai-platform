import "./styles/as6-design-token-registry.css";
import "./styles/as6-design-system-foundation-v220.css";
import "./styles/as6-real-component-consolidation.css";
import "./styles/as6-physical-page-refactor-migration.css";
import "./styles/as6-real-page-conversion-engine.css";
import "./styles/as6-real-data-surface-migration.css";
import "./styles/as6-unified-data-surface-system.css";
import "./styles/as6-direct-page-rewrite-framework.css";
import "./styles/as6-real-page-component-migration.css";
import "./styles/as6-real-page-shell-migration.css";
import "./styles/as6-unified-page-shell.css";
import "./styles/as6-full-mission-control-theme-rollout.css";
import "./styles/as6-unified-mission-control-ui.css";
import "./styles/as6-mission-workspace.css";
import "./styles/as6-workspace-v224.css";
import "./styles/as6-sidebar-v225.css";
import "./styles/as6-header-v226.css";
import "./styles/as6-right-rail-v227.css";
import "./styles/as6-core-v228.css";
import "./styles/as6-assistant-v229.css";
import "./styles/as6-focus-v230.css";
import "./styles/as6-crm-workspace-client-v231.css";
import "./styles/as6-crm-workspace-client-v232.css";
import "./styles/as6-crm-workspace-ui-review-v236.css";
import { markAs6DesignSystemReady } from "./utils/as6RuntimeTracer";
import React, { createContext, useContext, useEffect, useMemo, useState, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CRMBrandV2Page from "./pages/CRMBrandV2Page";
import AS6OSPage from "./pages/AS6OSPage";
import CRMWorkspacePage from "./pages/CRMWorkspacePage";
import AS6WorkspacePage from "./pages/AS6WorkspacePage";
import "./styles.css";
import "./theme/as6Theme.css";
import { ProtectedLayout } from "./components/AppShell";
import LandingPage from "./pages/LandingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import "./styles/as6-mission-control.css";
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CRMPage = lazy(() => import("./pages/CRMPage"));
const AiWorkersPage = lazy(() => import("./pages/AiWorkersPage"));
import FollowupsPage from "./pages/FollowupsPage";
import PriorityInboxPage from "./pages/PriorityInboxPage";
const PipelineCopilotPage = lazy(() => import("./pages/PipelineCopilotPage"));
const AiManagerDashboardPage = lazy(() => import("./pages/AiManagerDashboardPage"));
import AiVoiceOutreachPage from "./pages/AiVoiceOutreachPage";
import AiRealtimeVoicePage from "./pages/AiRealtimeVoicePage";
import AiRevenueIntelligencePage from "./pages/AiRevenueIntelligencePage";
import AiRevenueEnginePage from "./pages/AiRevenueEnginePage";
const AiLiveRealtimeVoicePage = lazy(() => import("./pages/AiLiveRealtimeVoicePage"));
import AiApprovalCenterPage from "./pages/AiApprovalCenterPage";
import AiExecutionCenterPage from "./pages/AiExecutionCenterPage";
import AiWorkforceCenterPage from "./pages/AiWorkforceCenterPage";
import AiExecutiveBrainPage from "./pages/AiExecutiveBrainPage";
import AiExecutiveUnifiedDashboardPage from "./pages/AiExecutiveUnifiedDashboardPage";
import AiCompanySimulationPage from "./pages/AiCompanySimulationPage";
import AiStrategicPlanningPage from "./pages/AiStrategicPlanningPage";
import AiEnterpriseCoordinationPage from "./pages/AiEnterpriseCoordinationPage";
import AiOrganizationalMemoryPage from "./pages/AiOrganizationalMemoryPage";
import AiSystemHealthCenterPage from "./pages/AiSystemHealthCenterPage";
const AIEnterpriseCommandCenter = lazy(() => import("./pages/AIEnterpriseCommandCenter"));
const CommandCenterPage = lazy(() => import("./pages/CommandCenterPage"));
const AS6OnePage = lazy(() => import("./pages/AS6OnePage"));
const RevenueDashboardPage = lazy(() => import("./pages/RevenueDashboardPage"));
import { getAuthToken, getStoredUser } from "./services/api";

const AuthContext = createContext({ token: null, user: null, isAuthenticated: false });

function getAuthState() {
  const token = getAuthToken();
  return {
    token,
    user: getStoredUser(),
    isAuthenticated: Boolean(token),
  };
}

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getAuthState);

  useEffect(() => {
    markAs6DesignSystemReady({ route: window.location.pathname });

    function syncAuthState(event) {
      if (event?.type === "ai-platform-auth-updated" && event.detail?.token) {
        setAuthState({
          token: event.detail.token,
          user: event.detail.user || null,
          isAuthenticated: true,
        });
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

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function ProtectedRoute({ children }) {
  return (
    <RequireAuth>
      <ProtectedLayout>{children}</ProtectedLayout>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={window.location.pathname === "/command-center" ? null : <div className="as6-route-loading">Загрузка...</div>}>
          <Routes>
          <Route path="/crm-v2" element={<ProtectedRoute><CRMBrandV2Page /></ProtectedRoute>} />
          <Route path="/as6-os" element={<AS6OSPage />} />
          <Route path="/crm-workspace" element={<CRMWorkspacePage />} />
          <Route path="/as6-workspace" element={<AS6WorkspacePage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/crm" element={<ProtectedRoute><CRMPage /></ProtectedRoute>} />
          <Route path="/ai-workers" element={<ProtectedRoute><AiWorkersPage /></ProtectedRoute>} />
          <Route path="/followups" element={<ProtectedRoute><FollowupsPage /></ProtectedRoute>} />
          <Route path="/priority-inbox" element={<ProtectedRoute><PriorityInboxPage /></ProtectedRoute>} />
          <Route path="/pipeline-copilot" element={<ProtectedRoute><PipelineCopilotPage /></ProtectedRoute>} />
          <Route path="/ai-manager-dashboard" element={<ProtectedRoute><AiManagerDashboardPage /></ProtectedRoute>} />
          <Route path="/ai-voice-outreach" element={<ProtectedRoute><AiVoiceOutreachPage /></ProtectedRoute>} />
          <Route path="/ai-realtime-voice" element={<ProtectedRoute><AiRealtimeVoicePage /></ProtectedRoute>} />
          <Route path="/ai-live-streaming" element={<ProtectedRoute><AiLiveRealtimeVoicePage /></ProtectedRoute>} />
          <Route path="/ai-revenue-intelligence" element={<ProtectedRoute><AiRevenueIntelligencePage /></ProtectedRoute>} />
          <Route path="/ai-revenue-engine" element={<ProtectedRoute><AiRevenueEnginePage /></ProtectedRoute>} />
          <Route path="/ai-approval-center" element={<ProtectedRoute><AiApprovalCenterPage /></ProtectedRoute>} />
          <Route path="/ai-execution-center" element={<ProtectedRoute><AiExecutionCenterPage /></ProtectedRoute>} />
          <Route path="/ai-workforce-center" element={<ProtectedRoute><AiWorkforceCenterPage /></ProtectedRoute>} />
          <Route path="/ai-executive-brain" element={<ProtectedRoute><AiExecutiveBrainPage /></ProtectedRoute>} />
          <Route path="/ai-executive-dashboard" element={<ProtectedRoute><AiExecutiveUnifiedDashboardPage /></ProtectedRoute>} />
          <Route path="/ai-company-simulation" element={<ProtectedRoute><AiCompanySimulationPage /></ProtectedRoute>} />
          <Route path="/ai-strategic-planning" element={<ProtectedRoute><AiStrategicPlanningPage /></ProtectedRoute>} />
          <Route path="/ai/strategic-planning" element={<ProtectedRoute><AiStrategicPlanningPage /></ProtectedRoute>} />
          <Route path="/ai-enterprise-coordination" element={<ProtectedRoute><AiEnterpriseCoordinationPage /></ProtectedRoute>} />
          <Route path="/ai/enterprise-coordination" element={<ProtectedRoute><AiEnterpriseCoordinationPage /></ProtectedRoute>} />
          <Route path="/ai-organizational-memory" element={<ProtectedRoute><AiOrganizationalMemoryPage /></ProtectedRoute>} />
          <Route path="/ai/organizational-memory" element={<ProtectedRoute><AiOrganizationalMemoryPage /></ProtectedRoute>} />
          <Route path="/ai-system-health-center" element={<ProtectedRoute><AiSystemHealthCenterPage /></ProtectedRoute>} />
          <Route path="/ai/system-health" element={<ProtectedRoute><AiSystemHealthCenterPage /></ProtectedRoute>} />
          <Route path="/ai/revenue-engine" element={<ProtectedRoute><AiRevenueEnginePage /></ProtectedRoute>} />
          <Route path="/ai/workforce" element={<ProtectedRoute><AiWorkforceCenterPage /></ProtectedRoute>} />
          <Route path="/ai/approval-center" element={<ProtectedRoute><AiApprovalCenterPage /></ProtectedRoute>} />
          <Route path="/ai-enterprise-command-center" element={<ProtectedRoute><AIEnterpriseCommandCenter /></ProtectedRoute>} />
          <Route path="/command-center" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
          <Route path="/as6-one" element={<ProtectedRoute><AS6OnePage /></ProtectedRoute>} />
          <Route path="/crm-enterprise" element={<ProtectedRoute><AS6OnePage /></ProtectedRoute>} />
          <Route path="/crm-v3" element={<ProtectedRoute><AS6OnePage /></ProtectedRoute>} />
          <Route path="/dashboard/revenue" element={<ProtectedRoute><RevenueDashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
