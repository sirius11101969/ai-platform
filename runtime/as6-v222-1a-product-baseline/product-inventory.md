# AS6 V222.1A Product Inventory

HEAD: 5d03b5091e6989f1f7396351eb7cf5dfd1365267
RESTORE_TAGS: AS6_RESTORE_V221_9_RELEASE_PASSPORT_20260625T152933Z

## Routes
125:          <Route path="/" element={<LandingPage />} />
126:          <Route path="/signup" element={<SignupPage />} />
127:          <Route path="/login" element={<LoginPage />} />
128:          <Route path="/payment/success" element={<PaymentSuccessPage />} />
129:          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
130:          <Route path="/crm" element={<ProtectedRoute><CRMPage /></ProtectedRoute>} />
131:          <Route path="/ai-workers" element={<ProtectedRoute><AiWorkersPage /></ProtectedRoute>} />
132:          <Route path="/followups" element={<ProtectedRoute><FollowupsPage /></ProtectedRoute>} />
133:          <Route path="/priority-inbox" element={<ProtectedRoute><PriorityInboxPage /></ProtectedRoute>} />
134:          <Route path="/pipeline-copilot" element={<ProtectedRoute><PipelineCopilotPage /></ProtectedRoute>} />
135:          <Route path="/ai-manager-dashboard" element={<ProtectedRoute><AiManagerDashboardPage /></ProtectedRoute>} />
136:          <Route path="/ai-voice-outreach" element={<ProtectedRoute><AiVoiceOutreachPage /></ProtectedRoute>} />
137:          <Route path="/ai-realtime-voice" element={<ProtectedRoute><AiRealtimeVoicePage /></ProtectedRoute>} />
138:          <Route path="/ai-live-streaming" element={<ProtectedRoute><AiLiveRealtimeVoicePage /></ProtectedRoute>} />
139:          <Route path="/ai-revenue-intelligence" element={<ProtectedRoute><AiRevenueIntelligencePage /></ProtectedRoute>} />
140:          <Route path="/ai-revenue-engine" element={<ProtectedRoute><AiRevenueEnginePage /></ProtectedRoute>} />
141:          <Route path="/ai-approval-center" element={<ProtectedRoute><AiApprovalCenterPage /></ProtectedRoute>} />
142:          <Route path="/ai-execution-center" element={<ProtectedRoute><AiExecutionCenterPage /></ProtectedRoute>} />
143:          <Route path="/ai-workforce-center" element={<ProtectedRoute><AiWorkforceCenterPage /></ProtectedRoute>} />
144:          <Route path="/ai-executive-brain" element={<ProtectedRoute><AiExecutiveBrainPage /></ProtectedRoute>} />
145:          <Route path="/ai-executive-dashboard" element={<ProtectedRoute><AiExecutiveUnifiedDashboardPage /></ProtectedRoute>} />
146:          <Route path="/ai-company-simulation" element={<ProtectedRoute><AiCompanySimulationPage /></ProtectedRoute>} />
147:          <Route path="/ai-strategic-planning" element={<ProtectedRoute><AiStrategicPlanningPage /></ProtectedRoute>} />
148:          <Route path="/ai/strategic-planning" element={<ProtectedRoute><AiStrategicPlanningPage /></ProtectedRoute>} />
149:          <Route path="/ai-enterprise-coordination" element={<ProtectedRoute><AiEnterpriseCoordinationPage /></ProtectedRoute>} />
150:          <Route path="/ai/enterprise-coordination" element={<ProtectedRoute><AiEnterpriseCoordinationPage /></ProtectedRoute>} />
151:          <Route path="/ai-organizational-memory" element={<ProtectedRoute><AiOrganizationalMemoryPage /></ProtectedRoute>} />
152:          <Route path="/ai/organizational-memory" element={<ProtectedRoute><AiOrganizationalMemoryPage /></ProtectedRoute>} />
153:          <Route path="/ai-system-health-center" element={<ProtectedRoute><AiSystemHealthCenterPage /></ProtectedRoute>} />
154:          <Route path="/ai/system-health" element={<ProtectedRoute><AiSystemHealthCenterPage /></ProtectedRoute>} />
155:          <Route path="/ai/revenue-engine" element={<ProtectedRoute><AiRevenueEnginePage /></ProtectedRoute>} />
156:          <Route path="/ai/workforce" element={<ProtectedRoute><AiWorkforceCenterPage /></ProtectedRoute>} />
157:          <Route path="/ai/approval-center" element={<ProtectedRoute><AiApprovalCenterPage /></ProtectedRoute>} />
158:          <Route path="/ai-enterprise-command-center" element={<ProtectedRoute><AIEnterpriseCommandCenter /></ProtectedRoute>} />
159:          <Route path="/command-center" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
160:          <Route path="/dashboard/revenue" element={<ProtectedRoute><RevenueDashboardPage /></ProtectedRoute>} />
161:          <Route path="*" element={<Navigate to="/" replace />} />

## Pages
frontend/src/pages/AiApprovalCenterPage.jsx
frontend/src/pages/AiCompanySimulationPage.jsx
frontend/src/pages/AIEnterpriseCommandCenter.jsx
frontend/src/pages/AiEnterpriseCoordinationPage.jsx
frontend/src/pages/AiExecutionCenterPage.jsx
frontend/src/pages/AiExecutiveBrainPage.jsx
frontend/src/pages/AiExecutiveUnifiedDashboardPage.jsx
frontend/src/pages/AiLiveRealtimeVoicePage.jsx
frontend/src/pages/AiManagerDashboardPage.jsx
frontend/src/pages/AiOrganizationalMemoryPage.jsx
frontend/src/pages/AiRealtimeVoicePage.jsx
frontend/src/pages/AiRevenueEnginePage.jsx
frontend/src/pages/AiRevenueIntelligencePage.jsx
frontend/src/pages/AiStrategicPlanningPage.jsx
frontend/src/pages/AiSystemHealthCenterPage.jsx
frontend/src/pages/AiVoiceOutreachPage.jsx
frontend/src/pages/AiWorkersPage.jsx
frontend/src/pages/AiWorkforceCenterPage.jsx
frontend/src/pages/AuthPages.jsx
frontend/src/pages/CommandCenterPage.jsx
frontend/src/pages/crm/CRMActionsPanel.jsx
frontend/src/pages/crm/CRMAnalyticsPanel.jsx
frontend/src/pages/crm/CRMFiltersPanel.jsx
frontend/src/pages/crm/CRMKanbanPanel.jsx
frontend/src/pages/crm/CRMPipelinePanel.jsx
frontend/src/pages/CRMPage.jsx
frontend/src/pages/DashboardPage.jsx
frontend/src/pages/FollowupsPage.jsx
frontend/src/pages/LandingPage.jsx
frontend/src/pages/PaymentSuccessPage.jsx
frontend/src/pages/PipelineCopilotPage.jsx
frontend/src/pages/PriorityInboxPage.jsx
frontend/src/pages/RevenueDashboardPage.jsx

## Components
frontend/src/components/AppShell.jsx
frontend/src/components/AS6AICopilotRail.jsx
frontend/src/components/as6/AS6FirstDawnPanel.jsx
frontend/src/components/AS6AutonomousOperationsTimeline.jsx
frontend/src/components/AS6BackendConnectorStatus.jsx
frontend/src/components/AS6CrmLiveDataStatus.jsx
frontend/src/components/AS6DashboardLiveDataStatus.jsx
frontend/src/components/AS6DirectPageRewriteFramework.jsx
frontend/src/components/AS6ExecutiveCommandDashboard.jsx
frontend/src/components/AS6ExecutiveControlTowerCompletion.jsx
frontend/src/components/AS6GlobalCommandPalette.jsx
frontend/src/components/AS6GlobalEventStream.jsx
frontend/src/components/AS6GlobalHealthBar.jsx
frontend/src/components/AS6LiveOperationalDataStatus.jsx
frontend/src/components/AS6MissionControlLayoutEngine.jsx
frontend/src/components/AS6MissionControlUI.jsx
frontend/src/components/AS6PhysicalPageRefactorBridge.jsx
frontend/src/components/AS6RealComponentConsolidation.jsx
frontend/src/components/AS6RealPageConversionEngine.jsx
frontend/src/components/AS6RevenueCrmFusionStatus.jsx
frontend/src/components/AS6UnifiedDataSurface.jsx
frontend/src/components/AS6UnifiedPageShell.jsx
frontend/src/components/avatars/CopilotAsset.jsx
frontend/src/components/branding/AS6Logo.jsx
frontend/src/components/icons/TopbarIcons.jsx

## Landing CTA
67:function LeadCaptureForm({ source = "landing_cta", compact = false }) {
128:      <button className="btn primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Отправляем…" : "Оставить заявку"}</button>
198:        <a href="#top" className="brand"><span>AI</span> Платформа продаж</a>
200:          <a href="#agents">Агенты</a>
201:          <a href="#workflow">CRM</a>
202:          <a href="#pricing">Тарифы</a>
205:  <a className="nav-cta" href="/login">Войти</a>
206:  <a className="nav-cta" href="https://t.me/" target="_blank" rel="noreferrer">Демо в Telegram</a>
219:            <a className="btn primary" href="#lead-form">Получить демо</a>
220:            <a className="btn secondary" href="#calculator">Рассчитать выручку</a>
344:            <button
345:type="button"
346:className="pricing-cta-btn"
347:onClick={() => startCheckout(plan)}
350:</button>
375:    <section className="final-cta">
376:      <motion.div className="cta-panel shell-glow" {...fadeUp}>
381:          <a className="btn primary" href="#lead-form">Получить демо</a>
382:          <a className="btn secondary" href="#pricing">Сравнить тарифы</a>
384:        <LeadCaptureForm source="final_cta" compact />

## Auth CTA
66:        <button className="btn primary" type="submit" disabled={isSubmitting}>
68:        </button>

## CRM CTA
1131:<div className="ai-action-center-buttons"><button className="ghost-button" type="button" onClick={handleAnalyzeWorkspaceAi} disabled={aiAnalysisBusy}>{aiAnalysisBusy ? "Scoring запущен…" : "Запустить scoring"}</button><button className="btn primary compact" type="button" onClick={handleQueueInactiveFollowUps} disabled={inactiveQueueBusy}>{inactiveQueueBusy ? "AI ставит в очередь…" : "Поставить follow-up для неактивных"}</button></div>
1202:                      onClick={() => openDetail(lead)}
1394:        <button className="btn primary compact" type="button" onClick={onRun} disabled={busy}>{busy ? "Running analysis…" : "Run Revenue Analysis Now"}</button>
1457:          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
1494:          <button className="modal-close" type="button" onClick={onClose} disabled={saving} aria-label="Закрыть">×</button>
1504:          <div className="form-actions modal-actions"><span>{saving ? "Сохраняем данные…" : "JWT + PostgreSQL"}</span><button className="btn primary compact" disabled={saving} type="submit">{saving && <i className="button-spinner" />}{saving ? "Сохраняем…" : submitLabel}</button></div>
1518:    <div className="modal-backdrop crm-modal-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) closeLeadModal(); }}>
1519:      <section className="ai-task-modal lead-detail-modal" role="dialog" aria-modal="true" aria-labelledby="lead-detail-title" onClick={(e) => e.stopPropagation()}>
1528:          <button className="modal-close lead-modal-close" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeLeadModal(); }} aria-label="Закрыть карточку лида"><span aria-hidden="true">×</span></button>
1561:                <button className="btn primary compact" type="button" onClick={onStartAiSequence} disabled={Boolean(aiSequence) || aiSequenceBusy === "start"}>{aiSequenceBusy === "start" ? "Starting…" : "Start AI Sequence"}</button>
1562:                <button className="ghost-button compact" type="button" onClick={() => onPauseAiSequence(aiSequence)} disabled={!aiSequence || aiSequenceBusy === "pause"}>{aiSequenceBusy === "pause" ? "Pausing…" : "Pause"}</button>
1563:                <button className="ghost-button compact danger-action" type="button" onClick={() => onStopAiSequence(aiSequence)} disabled={!aiSequence || aiSequenceBusy === "stop"}>{aiSequenceBusy === "stop" ? "Stopping…" : "Stop"}</button>
1583:                <div className="execution-buttons">
1584:                  <button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] || !['pending_approval','failed'].includes(getStageRecommendation(lead, actionCenter).status)}>{executionBusy[getStageRecommendation(lead, actionCenter).id] ? 'Обновляем…' : 'Approve stage change'}</button>
1585:                  <button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] || getStageRecommendation(lead, actionCenter).status !== 'approved'}>{executionBusy[getStageRecommendation(lead, actionCenter).id] ? 'Выполняем…' : 'Execute stage change'}</button>
1586:                  <button type="button" className="ghost-button compact danger-action" onClick={() => onRejectApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] || ['executing','completed','executed','rejected'].includes(getStageRecommendation(lead, actionCenter).status)}>Reject</button>
1667:                <button className="ghost-button" type="button" onClick={onAnalyzeLeadAi} disabled={aiActionBusy[`${lead.id}:lead_ai_score`]}>{aiActionBusy[`${lead.id}:lead_ai_score`] ? 'AI считает…' : 'Рассчитать AI score'}</button>
1688:              {getLeadAiScore(lead) && <div className="ai-advisor-strip"><p><b>AI рекомендация:</b> {sanitizeVisibleAiText(getLeadAiScore(lead).recommendedNextStep || getLeadAiScore(lead).nextBestAction || "Назначить следующий шаг")}</p><p><b>Рекомендуемый CTA:</b> {sanitizeVisibleAiText(getLeadAiScore(lead).recommendedCta || "Назначить следующий шаг")}</p><p><b>Возражения:</b> {sanitizeVisibleAiText((getLeadAiScore(lead).objectionsDetected || []).join(", ") || "не обнаружены")}</p><p><b>AI Outreach Engine:</b> {telegramOutreachDrafts.length + emailOutreachDrafts.length} черновиков ждут approval · readiness {getLeadAiScore(lead).temperature === 'hot' ? 'немедленно' : getLeadAiScore(lead).temperature === 'warm' ? 'первый контакт' : 'только рекомендация'}</p>{getLatestAiVoiceCall(lead) && <p><b>AI Voice outcome:</b> {getLatestAiVoiceCall(lead).sentiment || '—'} · {getLatestAiVoiceCall(lead).outcome || '—'} · {sanitizeVisibleAiText(getLatestAiVoiceCall(lead).nextAction || '—')}</p>}</div>}
1712:                  {meeting.googleMeetUrl && <a className="calendar-meet-url" href={meeting.googleMeetUrl} target="_blank" rel="noreferrer">{meeting.googleMeetUrl}</a>}
1715:                    {meeting.googleMeetUrl && <a className="btn primary compact" href={meeting.googleMeetUrl} target="_blank" rel="noreferrer">Открыть Google Meet</a>}
1716:                    <button type="button" className="btn primary compact" onClick={() => onDownloadMeetingIcs?.(meeting)} disabled={!meeting.hasIcs || meetingIcsDownloadingId === meeting.id}>{meetingIcsDownloadingId === meeting.id ? 'Скачиваем…' : meeting.hasIcs ? 'Скачать .ics' : '.ics готовится'}</button>
1727:              <div className="ai-action-buttons">
1728:                <button className="ghost-button" type="button" onClick={onAnalyzeLeadAi} disabled={aiActionBusy[`${lead.id}:lead_ai_score`]}>{aiActionBusy[`${lead.id}:lead_ai_score`] ? "AI считает…" : "AI score + прогноз"}</button>
1737:                ].map(([actionType, title]) => <button className="ghost-button" type="button" key={actionType} onClick={() => onCreateExecutionAction(actionType)} disabled={executionBusy.create}>{title}</button>)}
1742:                <button className="ghost-button compact" type="button" onClick={() => onSendMaterials(['presentation'], isTelegramLead(lead) ? 'telegram' : 'email')} disabled={executionBusy.materials}>Отправить презентацию</button>
1743:                <button className="ghost-button compact" type="button" onClick={() => onSendMaterials(['screenshot_1', 'screenshot_2'], isTelegramLead(lead) ? 'telegram' : 'email')} disabled={executionBusy.materials}>Отправить скриншоты</button>
1752:                    <div className="execution-buttons">
1753:                      <button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(item)} disabled={executionBusy[item.id] || !['pending_approval','failed'].includes(item.status)}>{executionBusy[item.id] ? 'Работаем…' : 'Одобрить'}</button>
1754:                      <button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(item)} disabled={executionBusy[item.id] || item.status !== 'approved'}>{executionBusy[item.id] ? 'Отправляем…' : 'Отправить'}</button>
1755:                      <button type="button" className="ghost-button compact" onClick={() => onEditApprovalQueueItem(item)} disabled={executionBusy[item.id] || ['executing','completed','executed'].includes(item.status)}>Изменить</button>
1756:                      <button type="button" className="ghost-button compact danger-action" onClick={() => onRejectApprovalQueueItem(item)} disabled={executionBusy[item.id] || ['executing','completed','executed','rejected'].includes(item.status)}>Отклонить</button>
1778:                    <div className="execution-buttons">
1779:                      <button type="button" className="ghost-button compact" onClick={() => onApproveExecutionAction(action)} disabled={executionBusy[action.id] || ['approved','sent','cancelled'].includes(action.status)}>Одобрить</button>
1780:                      <button type="button" className="btn primary compact" onClick={() => onSendExecutionAction(action)} disabled={executionBusy[action.id] || ['sent','failed','cancelled'].includes(action.status)}>Отправить</button>
1781:                      <button type="button" className="ghost-button compact" onClick={() => onEditExecutionAction(action)} disabled={executionBusy[action.id] || ['sent','cancelled'].includes(action.status)}>Изменить</button>
1782:                      <button type="button" className="ghost-button compact danger-action" onClick={() => onCancelExecutionAction(action)} disabled={executionBusy[action.id] || ['sent','cancelled'].includes(action.status)}>Отклонить</button>
1823:                          <a href={lead.metadata.sequence_checkout_url} target="_blank" rel="noreferrer">
1890:                    <div className="execution-buttons"><button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || !['pending_approval','failed'].includes(draft.status)}>{executionBusy[draft.id] ? 'Работаем…' : 'Одобрить'}</button><button type="button" className="ghost-button compact" onClick={() => onEditApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || ['executing','completed'].includes(draft.status)}>Изменить</button><button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || draft.status !== 'approved'}>{executionBusy[draft.id] ? 'Отправляем…' : 'Отправить'}</button></div>
1893:                {telegramOutreachDrafts.map((draft) => <p className="ai-sequence-draft" key={draft.id}><b>{outreachTypeLabel(draft.outreachType)}:</b> {sanitizeCustomerVisibleText(draft.text)}<small>{actionStatusLabel(draft.status)} · score {draft.score || '—'} · {draft.temperature || 'AI'} · {formatDate(draft.createdAt)}</small><span className="execution-buttons"><button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || !['pending_approval','failed'].includes(draft.status)}>{executionBusy[draft.id] ? 'Работаем…' : 'Одобрить'}</button><button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || draft.status !== 'approved'}>{executionBusy[draft.id] ? 'Отправляем…' : 'Отправить'}</button></span></p>)}
1914:                      <button className="ghost-button compact" type="button" disabled={!getLeadTelegramConnectLink(lead)} onClick={() => navigator.clipboard?.writeText(getLeadTelegramConnectLink(lead))}>Скопировать</button>
1915:                      <a className={`btn primary compact ${!getLeadTelegramConnectLink(lead) ? 'disabled-link' : ''}`} href={getLeadTelegramConnectLink(lead) || undefined} target="_blank" rel="noreferrer" aria-disabled={!getLeadTelegramConnectLink(lead)}>Открыть Telegram</a>
1930:                  <button className="btn primary compact" disabled={telegramSending || !telegramDraft.trim() || !hasTelegramChatId(lead)} type="submit">{telegramSending ? 'Отправляем…' : 'Ответить в Telegram'}</button>
1945:                {emailOutreachDrafts.map((draft) => <p className="ai-sequence-draft" key={draft.id}><b>{outreachTypeLabel(draft.outreachType)} · {draft.subject}:</b> {sanitizeCustomerVisibleText(draft.text)}<small>{draft.status} · CTA: {draft.cta || '—'} · {formatDate(draft.createdAt)}</small>{draft.demoProposal && <small>{sanitizeVisibleAiText(draft.demoProposal)}</small>}</p>)}
1956:                  <label className="ghost-button file-upload-button">Загрузить вложение<input type="file" onChange={onUploadEmailAttachment} /></label>
1957:                  <button className="ghost-button" type="button" onClick={onGenerateEmail} disabled={emailBusy}>{emailBusy ? 'AI готовит…' : 'AI сгенерировать письмо'}</button>
1958:                  <button className="btn primary compact" type="submit" disabled={emailBusy || !emailComposer.to || !emailComposer.subject}>{emailBusy ? 'Отправляем…' : 'Отправить email'}</button>
1982:                <button className="btn primary compact" type="submit">Добавить заметку</button>
1987:              <button className="btn primary compact" type="button" onClick={onFollowUp} disabled={followUpLoading}>{followUpLoading ? "AI думает…" : "Сгенерировать AI‑дожим"}</button>
1988:              <button className="ghost-button" type="button" onClick={onEdit}>Редактировать</button>
1989:              <button className="ghost-button danger-action" type="button" onClick={onDelete}>Удалить</button>
2021:          <button className="ghost-button compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "call")}>📞 Позвонить</button>
2022:          <button className="ghost-button compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "meeting")}>📅 Встреча</button>
2023:          <button className="ghost-button compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "proposal")}>📨 КП</button>
2024:          <button className="btn primary compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "checkout")}>💳 Оплата</button>
2025:          <button className="btn primary compact" type="button" onClick={() => onTestPaymentPaid?.(lead)}>✅ Test Paid</button>
2026:          <button className="ghost-button" type="button" onClick={closeLeadModal}>Закрыть</button>
