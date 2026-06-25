# AS6 V222.1A User Journey and CTA Inventory

HEAD: 5d03b5091e6989f1f7396351eb7cf5dfd1365267
RESTORE_TAGS: AS6_RESTORE_V221_9_RELEASE_PASSPORT_20260625T152933Z

## Public Entry Journey
| Step | Route/Anchor | Source | Observed Action | Target |
|---|---|---|---|---|
| Landing | onClick/form/internal | LandingPage.jsx | 67:function LeadCaptureForm({ source = "landing_cta", compact = false }) { | onClick/form/internal |
| Landing | onClick/form/internal | LandingPage.jsx | 128:       {status === "sending" ? "Отправляем…" : "Оставить заявку"} | onClick/form/internal |
| Landing | #top | LandingPage.jsx | 198:          AI  Платформа продаж | #top |
| Landing | #agents | LandingPage.jsx | 200:           Агенты | #agents |
| Landing | #workflow | LandingPage.jsx | 201:           CRM | #workflow |
| Landing | #pricing | LandingPage.jsx | 202:           Тарифы | #pricing |
| Landing | /login | LandingPage.jsx | 205:   Войти | /login |
| Landing | https://t.me/ | LandingPage.jsx | 206:   Демо в Telegram | https://t.me/ |
| Landing | #lead-form | LandingPage.jsx | 219:             Получить демо | #lead-form |
| Landing | #calculator | LandingPage.jsx | 220:             Рассчитать выручку | #calculator |
| Landing | onClick/form/internal | LandingPage.jsx | 344:            <button | onClick/form/internal |
| Landing | onClick/form/internal | LandingPage.jsx | 345:type="button" | onClick/form/internal |
| Landing | onClick/form/internal | LandingPage.jsx | 346:className="pricing-cta-btn" | onClick/form/internal |
| Landing | onClick/form/internal | LandingPage.jsx | 347:onClick={() => startCheckout(plan)} | onClick/form/internal |
| Landing | onClick/form/internal | LandingPage.jsx | 350: | onClick/form/internal |
| Landing | onClick/form/internal | LandingPage.jsx | 375: | onClick/form/internal |
| Landing | onClick/form/internal | LandingPage.jsx | 376: | onClick/form/internal |
| Landing | #lead-form | LandingPage.jsx | 381:           Получить демо | #lead-form |
| Landing | #pricing | LandingPage.jsx | 382:           Сравнить тарифы | #pricing |
| Landing | onClick/form/internal | LandingPage.jsx | 384: | onClick/form/internal |

## Auth Journey
| Step | Source | Observed Action |
|---|---|---|
| Auth | AuthPages.jsx | 66: |
| Auth | AuthPages.jsx | 68: |

## CRM Action Surface
| Step | Source | Observed Action |
|---|---|---|
| CRM | CRMPage.jsx | 1131:  {aiAnalysisBusy ? "Scoring запущен…" : "Запустить scoring"}  {inactiveQueueBusy ? "AI ставит в очередь…" : "Поставить follow-up для неактивных"} |
| CRM | CRMPage.jsx | 1202:                      onClick={() => openDetail(lead)} |
| CRM | CRMPage.jsx | 1394:         {busy ? "Running analysis…" : "Run Revenue Analysis Now"} |
| CRM | CRMPage.jsx | 1457:           × |
| CRM | CRMPage.jsx | 1494:           × |
| CRM | CRMPage.jsx | 1504:            {saving ? "Сохраняем данные…" : "JWT + PostgreSQL"}  {saving &&  }{saving ? "Сохраняем…" : submitLabel} |
| CRM | CRMPage.jsx | 1518:      { if (e.target === e.currentTarget) closeLeadModal(); }}> |
| CRM | CRMPage.jsx | 1519:        e.stopPropagation()}> |
| CRM | CRMPage.jsx | 1528:            { e.preventDefault(); e.stopPropagation(); closeLeadModal(); }} aria-label="Закрыть карточку лида"> × |
| CRM | CRMPage.jsx | 1561:                 {aiSequenceBusy === "start" ? "Starting…" : "Start AI Sequence"} |
| CRM | CRMPage.jsx | 1562:                  onPauseAiSequence(aiSequence)} disabled={!aiSequence \|\| aiSequenceBusy === "pause"}>{aiSequenceBusy === "pause" ? "Pausing…" : "Pause"} |
| CRM | CRMPage.jsx | 1563:                  onStopAiSequence(aiSequence)} disabled={!aiSequence \|\| aiSequenceBusy === "stop"}>{aiSequenceBusy === "stop" ? "Stopping…" : "Stop"} |
| CRM | CRMPage.jsx | 1583: |
| CRM | CRMPage.jsx | 1584:                    onApproveApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] \|\| !['pending_approval','failed'].includes(getStageRecommendation(lead, actionCenter).status)}>{executionBusy[getStageRecommendation(lead, actionCenter).id] ? 'Обновляем…' : 'Approve stage change'} |
| CRM | CRMPage.jsx | 1585:                    onExecuteApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] \|\| getStageRecommendation(lead, actionCenter).status !== 'approved'}>{executionBusy[getStageRecommendation(lead, actionCenter).id] ? 'Выполняем…' : 'Execute stage change'} |
| CRM | CRMPage.jsx | 1586:                    onRejectApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] \|\| ['executing','completed','executed','rejected'].includes(getStageRecommendation(lead, actionCenter).status)}>Reject |
| CRM | CRMPage.jsx | 1667:                 {aiActionBusy[`${lead.id}:lead_ai_score`] ? 'AI считает…' : 'Рассчитать AI score'} |
| CRM | CRMPage.jsx | 1688:              {getLeadAiScore(lead) &&    AI рекомендация:  {sanitizeVisibleAiText(getLeadAiScore(lead).recommendedNextStep \|\| getLeadAiScore(lead).nextBestAction \|\| "Назначить следующий шаг")}   Рекомендуемый CTA:  {sanitizeVisibleAiText(getLeadAiScore(lead).recommendedCta \|\| "Назначить следующий шаг")}   Возражения:  {sanitizeVisibleAiText((getLeadAiScore(lead).objectionsDetected \|\| []).join(", ") \|\| "не обнаружены")}   AI Outreach Engine:  {telegramOutreachDrafts.length + emailOutreachDrafts.length} черновиков ждут approval · readiness {getLeadAiScore(lead).temperature === 'hot' ? 'немедленно' : getLeadAiScore(lead).temperature === 'warm' ? 'первый контакт' : 'только рекомендация'} {getLatestAiVoiceCall(lead) &&   AI Voice outcome:  {getLatestAiVoiceCall(lead).sentiment \|\| '—'} · {getLatestAiVoiceCall(lead).outcome \|\| '—'} · {sanitizeVisibleAiText(getLatestAiVoiceCall(lead).nextAction \|\| '—')} } } |
| CRM | CRMPage.jsx | 1712:                  {meeting.googleMeetUrl &&  {meeting.googleMeetUrl} } |
| CRM | CRMPage.jsx | 1715:                    {meeting.googleMeetUrl &&  Открыть Google Meet } |
| CRM | CRMPage.jsx | 1716:                      onDownloadMeetingIcs?.(meeting)} disabled={!meeting.hasIcs \|\| meetingIcsDownloadingId === meeting.id}>{meetingIcsDownloadingId === meeting.id ? 'Скачиваем…' : meeting.hasIcs ? 'Скачать .ics' : '.ics готовится'} |
| CRM | CRMPage.jsx | 1727: |
| CRM | CRMPage.jsx | 1728:                 {aiActionBusy[`${lead.id}:lead_ai_score`] ? "AI считает…" : "AI score + прогноз"} |
| CRM | CRMPage.jsx | 1737:                ].map(([actionType, title]) =>   onCreateExecutionAction(actionType)} disabled={executionBusy.create}>{title} )} |
| CRM | CRMPage.jsx | 1742:                  onSendMaterials(['presentation'], isTelegramLead(lead) ? 'telegram' : 'email')} disabled={executionBusy.materials}>Отправить презентацию |
| CRM | CRMPage.jsx | 1743:                  onSendMaterials(['screenshot_1', 'screenshot_2'], isTelegramLead(lead) ? 'telegram' : 'email')} disabled={executionBusy.materials}>Отправить скриншоты |
| CRM | CRMPage.jsx | 1752: |
| CRM | CRMPage.jsx | 1753:                        onApproveApprovalQueueItem(item)} disabled={executionBusy[item.id] \|\| !['pending_approval','failed'].includes(item.status)}>{executionBusy[item.id] ? 'Работаем…' : 'Одобрить'} |
| CRM | CRMPage.jsx | 1754:                        onExecuteApprovalQueueItem(item)} disabled={executionBusy[item.id] \|\| item.status !== 'approved'}>{executionBusy[item.id] ? 'Отправляем…' : 'Отправить'} |
| CRM | CRMPage.jsx | 1755:                        onEditApprovalQueueItem(item)} disabled={executionBusy[item.id] \|\| ['executing','completed','executed'].includes(item.status)}>Изменить |
| CRM | CRMPage.jsx | 1756:                        onRejectApprovalQueueItem(item)} disabled={executionBusy[item.id] \|\| ['executing','completed','executed','rejected'].includes(item.status)}>Отклонить |
| CRM | CRMPage.jsx | 1778: |
| CRM | CRMPage.jsx | 1779:                        onApproveExecutionAction(action)} disabled={executionBusy[action.id] \|\| ['approved','sent','cancelled'].includes(action.status)}>Одобрить |
| CRM | CRMPage.jsx | 1780:                        onSendExecutionAction(action)} disabled={executionBusy[action.id] \|\| ['sent','failed','cancelled'].includes(action.status)}>Отправить |
| CRM | CRMPage.jsx | 1781:                        onEditExecutionAction(action)} disabled={executionBusy[action.id] \|\| ['sent','cancelled'].includes(action.status)}>Изменить |
| CRM | CRMPage.jsx | 1782:                        onCancelExecutionAction(action)} disabled={executionBusy[action.id] \|\| ['sent','cancelled'].includes(action.status)}>Отклонить |
| CRM | CRMPage.jsx | 1823: |
| CRM | CRMPage.jsx | 1890:                       onApproveApprovalQueueItem(draft)} disabled={executionBusy[draft.id] \|\| !['pending_approval','failed'].includes(draft.status)}>{executionBusy[draft.id] ? 'Работаем…' : 'Одобрить'}   onEditApprovalQueueItem(draft)} disabled={executionBusy[draft.id] \|\| ['executing','completed'].includes(draft.status)}>Изменить   onExecuteApprovalQueueItem(draft)} disabled={executionBusy[draft.id] \|\| draft.status !== 'approved'}>{executionBusy[draft.id] ? 'Отправляем…' : 'Отправить'} |
| CRM | CRMPage.jsx | 1893:                {telegramOutreachDrafts.map((draft) =>   {outreachTypeLabel(draft.outreachType)}:  {sanitizeCustomerVisibleText(draft.text)} {actionStatusLabel(draft.status)} · score {draft.score \|\| '—'} · {draft.temperature \|\| 'AI'} · {formatDate(draft.createdAt)}    onApproveApprovalQueueItem(draft)} disabled={executionBusy[draft.id] \|\| !['pending_approval','failed'].includes(draft.status)}>{executionBusy[draft.id] ? 'Работаем…' : 'Одобрить'}   onExecuteApprovalQueueItem(draft)} disabled={executionBusy[draft.id] \|\| draft.status !== 'approved'}>{executionBusy[draft.id] ? 'Отправляем…' : 'Отправить'}   )} |
| CRM | CRMPage.jsx | 1914:                        navigator.clipboard?.writeText(getLeadTelegramConnectLink(lead))}>Скопировать |
| CRM | CRMPage.jsx | 1915:                       Открыть Telegram |
| CRM | CRMPage.jsx | 1930:                   {telegramSending ? 'Отправляем…' : 'Ответить в Telegram'} |
| CRM | CRMPage.jsx | 1945:                {emailOutreachDrafts.map((draft) =>   {outreachTypeLabel(draft.outreachType)} · {draft.subject}:  {sanitizeCustomerVisibleText(draft.text)} {draft.status} · CTA: {draft.cta \|\| '—'} · {formatDate(draft.createdAt)} {draft.demoProposal &&  {sanitizeVisibleAiText(draft.demoProposal)} } )} |
| CRM | CRMPage.jsx | 1956:                   Загрузить вложение |
| CRM | CRMPage.jsx | 1957:                   {emailBusy ? 'AI готовит…' : 'AI сгенерировать письмо'} |
| CRM | CRMPage.jsx | 1958:                   {emailBusy ? 'Отправляем…' : 'Отправить email'} |
| CRM | CRMPage.jsx | 1982:                 Добавить заметку |
| CRM | CRMPage.jsx | 1987:               {followUpLoading ? "AI думает…" : "Сгенерировать AI‑дожим"} |
| CRM | CRMPage.jsx | 1988:               Редактировать |
| CRM | CRMPage.jsx | 1989:               Удалить |
| CRM | CRMPage.jsx | 2021:            onAiSecretaryCrmAction?.(lead, "call")}>📞 Позвонить |
| CRM | CRMPage.jsx | 2022:            onAiSecretaryCrmAction?.(lead, "meeting")}>📅 Встреча |
| CRM | CRMPage.jsx | 2023:            onAiSecretaryCrmAction?.(lead, "proposal")}>📨 КП |
| CRM | CRMPage.jsx | 2024:            onAiSecretaryCrmAction?.(lead, "checkout")}>💳 Оплата |
| CRM | CRMPage.jsx | 2025:            onTestPaymentPaid?.(lead)}>✅ Test Paid |
| CRM | CRMPage.jsx | 2026:           Закрыть |
