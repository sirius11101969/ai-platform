# AS6 V222.1A Product Map

HEAD: 5d03b5091e6989f1f7396351eb7cf5dfd1365267
RESTORE_TAGS: AS6_RESTORE_V221_9_RELEASE_PASSPORT_20260625T152933Z

| Route | Access | Component | Product Area | Observed Purpose |
|---|---|---|---|---|
| `/` | Public | `LandingPage` | Landing | Public product entry point |
| `/signup` | Public | `SignupPage` | Auth | User authentication entry |
| `/login` | Public | `LoginPage` | Auth | User authentication entry |
| `/payment/success` | Public | `PaymentSuccessPage` | Billing | Payment completion confirmation |
| `/dashboard` | Protected | `DashboardPage` | Dashboard | Authenticated dashboard entry |
| `/crm` | Protected | `CRMPage` | CRM | Sales CRM workspace |
| `/ai-workers` | Protected | `AiWorkersPage` | AI Module | AI capability workspace |
| `/followups` | Protected | `FollowupsPage` | Sales Workflow | Sales workflow execution |
| `/priority-inbox` | Protected | `PriorityInboxPage` | Sales Workflow | Sales workflow execution |
| `/pipeline-copilot` | Protected | `PipelineCopilotPage` | Sales Workflow | Sales workflow execution |
| `/ai-manager-dashboard` | Protected | `AiManagerDashboardPage` | AI Module | AI capability workspace |
| `/ai-voice-outreach` | Protected | `AiVoiceOutreachPage` | AI Module | AI capability workspace |
| `/ai-realtime-voice` | Protected | `AiRealtimeVoicePage` | AI Module | AI capability workspace |
| `/ai-live-streaming` | Protected | `AiLiveRealtimeVoicePage` | AI Module | AI capability workspace |
| `/ai-revenue-intelligence` | Protected | `AiRevenueIntelligencePage` | AI Module | AI capability workspace |
| `/ai-revenue-engine` | Protected | `AiRevenueEnginePage` | AI Module | AI capability workspace |
| `/ai-approval-center` | Protected | `AiApprovalCenterPage` | AI Module | AI capability workspace |
| `/ai-execution-center` | Protected | `AiExecutionCenterPage` | AI Module | AI capability workspace |
| `/ai-workforce-center` | Protected | `AiWorkforceCenterPage` | AI Module | AI capability workspace |
| `/ai-executive-brain` | Protected | `AiExecutiveBrainPage` | AI Module | AI capability workspace |
| `/ai-executive-dashboard` | Protected | `AiExecutiveUnifiedDashboardPage` | AI Module | AI capability workspace |
| `/ai-company-simulation` | Protected | `AiCompanySimulationPage` | AI Module | AI capability workspace |
| `/ai-strategic-planning` | Protected | `AiStrategicPlanningPage` | AI Module | AI capability workspace |
| `/ai/strategic-planning` | Protected | `AiStrategicPlanningPage` | AI Module | AI capability workspace |
| `/ai-enterprise-coordination` | Protected | `AiEnterpriseCoordinationPage` | AI Module | AI capability workspace |
| `/ai/enterprise-coordination` | Protected | `AiEnterpriseCoordinationPage` | AI Module | AI capability workspace |
| `/ai-organizational-memory` | Protected | `AiOrganizationalMemoryPage` | AI Module | AI capability workspace |
| `/ai/organizational-memory` | Protected | `AiOrganizationalMemoryPage` | AI Module | AI capability workspace |
| `/ai-system-health-center` | Protected | `AiSystemHealthCenterPage` | AI Module | AI capability workspace |
| `/ai/system-health` | Protected | `AiSystemHealthCenterPage` | AI Module | AI capability workspace |
| `/ai/revenue-engine` | Protected | `AiRevenueEnginePage` | AI Module | AI capability workspace |
| `/ai/workforce` | Protected | `AiWorkforceCenterPage` | AI Module | AI capability workspace |
| `/ai/approval-center` | Protected | `AiApprovalCenterPage` | AI Module | AI capability workspace |
| `/ai-enterprise-command-center` | Protected | `AIEnterpriseCommandCenter` | Command Center | Operational command center |
| `/command-center` | Protected | `CommandCenterPage` | Command Center | Operational command center |
| `/dashboard/revenue` | Protected | `RevenueDashboardPage` | Dashboard | Revenue analytics dashboard |
| `*` | Public | `Navigate` | Fallback | Redirect unknown routes to landing |
