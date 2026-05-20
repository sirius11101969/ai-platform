import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";
import { ProtectedLayout } from "./components/AppShell";
import LandingPage from "./pages/LandingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import DashboardPage from "./pages/DashboardPage";
import CRMPage from "./pages/CRMPage";
import AiWorkersPage from "./pages/AiWorkersPage";
import FollowupsPage from "./pages/FollowupsPage";
import PriorityInboxPage from "./pages/PriorityInboxPage";
import PipelineCopilotPage from "./pages/PipelineCopilotPage";
import AiManagerDashboardPage from "./pages/AiManagerDashboardPage";
import AiVoiceOutreachPage from "./pages/AiVoiceOutreachPage";
import AiRealtimeVoicePage from "./pages/AiRealtimeVoicePage";
import AiRevenueIntelligencePage from "./pages/AiRevenueIntelligencePage";
import AiRevenueEnginePage from "./pages/AiRevenueEnginePage";
import AiLiveRealtimeVoicePage from "./pages/AiLiveRealtimeVoicePage";
import AiApprovalCenterPage from "./pages/AiApprovalCenterPage";
import AiExecutionCenterPage from "./pages/AiExecutionCenterPage";
import AiWorkforceCenterPage from "./pages/AiWorkforceCenterPage";
import AiExecutiveBrainPage from "./pages/AiExecutiveBrainPage";
import AiCompanySimulationPage from "./pages/AiCompanySimulationPage";
import AiStrategicPlanningPage from "./pages/AiStrategicPlanningPage";
import AiEnterpriseCoordinationPage from "./pages/AiEnterpriseCoordinationPage";
import AiOrganizationalMemoryPage from "./pages/AiOrganizationalMemoryPage";
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
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
          <Route path="/ai-company-simulation" element={<ProtectedRoute><AiCompanySimulationPage /></ProtectedRoute>} />
          <Route path="/ai-strategic-planning" element={<ProtectedRoute><AiStrategicPlanningPage /></ProtectedRoute>} />
          <Route path="/ai-enterprise-coordination" element={<ProtectedRoute><AiEnterpriseCoordinationPage /></ProtectedRoute>} />
          <Route path="/ai-organizational-memory" element={<ProtectedRoute><AiOrganizationalMemoryPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
