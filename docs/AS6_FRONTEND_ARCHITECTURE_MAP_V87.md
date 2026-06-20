# AS6 Frontend Architecture Map V87

Base commit: 0cf1f56
Project readiness: 100%
UX readiness before V87: 92%

## Core entry files
- frontend/src/App.jsx
- frontend/src/main.jsx
- frontend/src/styles/as6-mission-control.css
- frontend/src/styles/as6-mission-workspace.css

## Pages and page-like files
- frontend/src/pages/AiApprovalCenterPage.jsx
- frontend/src/pages/AiCompanySimulationPage.jsx
- frontend/src/pages/AIEnterpriseCommandCenter.jsx
- frontend/src/pages/AiEnterpriseCoordinationPage.jsx
- frontend/src/pages/AiExecutionCenterPage.jsx
- frontend/src/pages/AiExecutiveBrainPage.jsx
- frontend/src/pages/AiExecutiveUnifiedDashboardPage.jsx
- frontend/src/pages/AiLiveRealtimeVoicePage.jsx
- frontend/src/pages/AiManagerDashboardPage.jsx
- frontend/src/pages/AiOrganizationalMemoryPage.jsx
- frontend/src/pages/AiRealtimeVoicePage.jsx
- frontend/src/pages/AiRevenueEnginePage.jsx
- frontend/src/pages/AiRevenueIntelligencePage.jsx
- frontend/src/pages/AiStrategicPlanningPage.jsx
- frontend/src/pages/AiSystemHealthCenterPage.jsx
- frontend/src/pages/AiVoiceOutreachPage.jsx
- frontend/src/pages/AiWorkersPage.jsx
- frontend/src/pages/AiWorkforceCenterPage.jsx
- frontend/src/pages/AuthPages.jsx
- frontend/src/pages/CommandCenterPage.jsx
- frontend/src/pages/crm/CRMActionsPanel.jsx
- frontend/src/pages/crm/CRMAnalyticsPanel.jsx
- frontend/src/pages/crm/CRMFiltersPanel.jsx
- frontend/src/pages/crm/CRMKanbanPanel.jsx
- frontend/src/pages/crm/CRMPipelinePanel.jsx
- frontend/src/pages/CRMPage.jsx
- frontend/src/pages/DashboardPage.jsx
- frontend/src/pages/FollowupsPage.jsx
- frontend/src/pages/LandingPage.jsx
- frontend/src/pages/PaymentSuccessPage.jsx
- frontend/src/pages/PipelineCopilotPage.jsx
- frontend/src/pages/PriorityInboxPage.jsx
- frontend/src/pages/RevenueDashboardPage.jsx

## Components and component-like files
- frontend/src/components/AppShell.jsx
- frontend/src/components/avatars/CopilotAsset.jsx
- frontend/src/components/branding/AS6Logo.jsx
- frontend/src/components/icons/TopbarIcons.jsx
- frontend/src/pages/crm/CRMActionsPanel.jsx
- frontend/src/pages/crm/CRMAnalyticsPanel.jsx
- frontend/src/pages/crm/CRMFiltersPanel.jsx
- frontend/src/pages/crm/CRMKanbanPanel.jsx
- frontend/src/pages/crm/CRMPipelinePanel.jsx

## Detected design system layers
- frontend/src/styles/as6-mission-control.css
- frontend/src/styles/as6-mission-workspace.css

## V87 findings
- UI is now protected by global brand/workspace layers.
- Next UX gains require real reusable components, not additional CSS-only overlays.
- Priority component candidates: Global Health Bar, Command Palette, Copilot Rail, Event Stream, Widget Grid, Diagnostics Center.
