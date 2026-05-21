const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || '/api'
const AUTH_STORAGE_KEY = 'ai-platform-auth'
const LEGACY_TOKEN_KEYS = ['token', 'jwt', 'accessToken', 'authToken']
const WORKSPACE_STORAGE_KEY = 'ai-platform-workspace-id'

function canUseWebStorage() {
  return typeof window !== 'undefined'
}

function parseStoredSession(value) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch (_error) {
    return { token: value }
  }
}

function normalizeAuthSession(session) {
  if (!session) return null

  const token = session.token || session.accessToken || session.jwt || session.authToken
  if (!token) return null

  return {
    ...session,
    token,
  }
}

function readStorage(storage) {
  const session = normalizeAuthSession(parseStoredSession(storage.getItem(AUTH_STORAGE_KEY)))
  if (session) return session

  for (const key of LEGACY_TOKEN_KEYS) {
    const token = storage.getItem(key)
    if (token) return { token }
  }

  return null
}

function getStoredAuth() {
  if (!canUseWebStorage()) return null

  try {
    return readStorage(window.localStorage) || readStorage(window.sessionStorage)
  } catch (_error) {
    return null
  }
}

export function getAuthToken() {
  return getStoredAuth()?.token || null
}

export function getStoredUser() {
  return getStoredAuth()?.user || null
}

export function getActiveWorkspaceId() {
  if (!canUseWebStorage()) return null
  try { return window.localStorage.getItem(WORKSPACE_STORAGE_KEY) || null } catch (_error) { return null }
}

export function setActiveWorkspaceId(workspaceId) {
  if (!canUseWebStorage() || !workspaceId) return
  const previousWorkspaceId = getActiveWorkspaceId()
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId)
  if (previousWorkspaceId !== workspaceId) {
    window.dispatchEvent(new CustomEvent('ai-platform-workspace-updated', { detail: { workspaceId } }))
  }
}

export function saveAuthSession(session, { remember = true } = {}) {
  if (!canUseWebStorage()) return null

  const nextSession = normalizeAuthSession(session)
  if (!nextSession) return null

  const storage = remember ? window.localStorage : window.sessionStorage
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
  storage.setItem('token', nextSession.token)

  const fallbackStorage = remember ? window.sessionStorage : window.localStorage
  fallbackStorage.removeItem(AUTH_STORAGE_KEY)
  fallbackStorage.removeItem('token')

  window.dispatchEvent(new CustomEvent('ai-platform-auth-updated', { detail: nextSession }))
  return nextSession
}

export function updateStoredUser(userPatch) {
  const currentSession = getStoredAuth()
  if (!currentSession?.user) return

  const nextSession = {
    ...currentSession,
    user: { ...currentSession.user, ...userPatch },
  }
  saveAuthSession(nextSession)
  window.dispatchEvent(new CustomEvent('ai-platform-profile-updated', { detail: nextSession.user }))
}

export function clearAuthSession() {
  if (!canUseWebStorage()) return

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY)

  for (const key of LEGACY_TOKEN_KEYS) {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  }

  window.dispatchEvent(new CustomEvent('ai-platform-auth-cleared'))
}


function translateApiError(message) {
  const text = String(message || '')
  const exact = {
    'Missing bearer token': 'Не найден bearer‑токен авторизации',
    'Invalid or expired token': 'Токен недействителен или истёк',
    'Internal server error': 'Внутренняя ошибка сервера',
    'Email and password with at least 8 characters are required': 'Укажите эл. почту и пароль минимум из 8 символов',
    'User with this email already exists': 'Пользователь с такой эл. почтой уже существует',
    'Invalid email or password': 'Неверная эл. почта или пароль',
    'User not found': 'Пользователь не найден',
    'Lead name is required': 'Укажите имя лида',
    'Lead email or phone is required': 'Укажите эл. почту или телефон лида',
    'Lead email, telegram or phone is required': 'Укажите эл. почту, Telegram или телефон лида',
    'Note body is required': 'Введите текст заметки',
    'Lead value must be a non-negative number': 'Сумма лида должна быть неотрицательным числом',
    'Lead name cannot be blank': 'Имя лида не может быть пустым',
    'Prompt with at least 3 characters is required': 'Промпт должен содержать минимум 3 символа',
    'Prompt must be 4000 characters or fewer': 'Промпт должен быть не длиннее 4000 символов',
    'Invalid task id': 'Некорректный идентификатор задачи',
    'SMTP/Gmail credentials are not configured': 'SMTP/Gmail не настроен на сервере',
    'Attachment not found': 'Вложение не найдено',
    'Attachment is too large': 'Файл слишком большой',
    'Attachment file and content are required': 'Выберите файл вложения',
    'Email subject and body are required': 'Заполните тему и текст письма',
    'Lead email is required': 'В карточке лида нет email',
    'У лида нет email для отправки.': 'У лида нет email для отправки.',
    'Workspace name is required': 'Укажите название рабочего пространства',
    'Workspace not found': 'Рабочее пространство не найдено',
    'Workspace admin role is required': 'Нужна роль администратора пространства',
    'Workspace team members limit reached': 'Достигнут лимит участников тарифа',
    'OPENAI_API_KEY is required for AI agent actions': 'Для AI Agent нужен OPENAI_API_KEY на сервере',
    'OPENAI_API_KEY is required for CRM AI follow-up': 'Для AI follow-up нужен OPENAI_API_KEY на сервере',
    'OPENAI_API_KEY is required for Telegram AI sales reply': 'Для AI ответа в Telegram нужен OPENAI_API_KEY на сервере',
    'leadId is required': 'Выберите лида для AI действия',
    'Материал пока не загружен на сервер': 'Материал пока не загружен на сервер',
    'AI action must be approved before sending': 'Сначала одобрите AI действие',
    'Follow-up must be approved before sending': 'Сначала одобрите follow-up',
    'Follow-up job not found': 'Follow-up не найден',
    'Invalid follow-up status': 'Недопустимый статус follow-up',
    'Invalid follow-up channel': 'Недопустимый канал follow-up',
    'AI action not found': 'AI действие не найдено',
    'Invalid AI action type': 'Недопустимый тип AI действия',
    'Invalid AI action status': 'Недопустимый статус AI действия',
    'Telegram bot token is not configured': 'Telegram Bot API не настроен на сервере',
    'Lead has no Telegram chat id': 'У лида нет Telegram chat id. Можно отправить email или написать вручную.',
    'У лида нет Telegram chat id. Отправка в Telegram недоступна.': 'У лида нет Telegram chat id. Можно отправить email или написать вручную.',
    'У лида нет Telegram chat id. Можно отправить email или написать вручную.': 'У лида нет Telegram chat id. Можно отправить email или написать вручную.',
    'Демо-воронка уже создана.': 'Демо-воронка уже создана.',
  }
  if (exact[text]) return exact[text]
  if (text.startsWith('Status must be one of:')) return 'Статус должен быть одним из допустимых этапов CRM'
  if (text.startsWith('Task type must be one of:')) return 'Выберите допустимый тип AI‑задачи'
  if (text.startsWith('AI agent task type must be one of:')) return 'Выберите допустимое AI действие'
  if (text.startsWith('Insufficient credits:')) return text.replace(/Insufficient credits: (\d+) credits required/, 'Недостаточно AI‑кредитов: требуется $1')
  return text
}

function buildHeaders(options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  const workspaceId = options.workspaceId || getActiveWorkspaceId()
  if (!options.skipWorkspace && workspaceId && !headers['X-Workspace-Id'] && !headers['x-workspace-id']) {
    headers['X-Workspace-Id'] = workspaceId
  }

  const token = options.skipAuth ? null : getAuthToken()
  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function request(path, options = {}) {
  const { skipAuth, timeoutMs, signal, ...fetchOptions } = options
  const controller = !signal && timeoutMs ? new AbortController() : null
  const timeoutId = controller ? globalThis.setTimeout(() => controller.abort(), timeoutMs) : null

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      signal: signal || controller?.signal,
      headers: buildHeaders(options),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession()
      }

      const backendMessage = data.message || data.details || data.error
      const error = new Error(translateApiError(backendMessage || 'Не удалось выполнить запрос к API'))
      error.status = response.status
      error.payload = data
      throw error
    }

    return data
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(`Превышено время ожидания запроса (${Math.round((timeoutMs || 0) / 1000)} сек.)`)
      timeoutError.code = 'REQUEST_TIMEOUT'
      throw timeoutError
    }
    throw error
  } finally {
    if (timeoutId) globalThis.clearTimeout(timeoutId)
  }
}

function publicRequest(path, options = {}) {
  return request(path, {
    ...options,
    skipAuth: true,
  })
}

export function signup({ email, password }) {
  return publicRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function login({ email, password }) {
  return publicRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function submitPublicLead(payload) {
  return publicRequest('/public/leads', {
    method: 'POST',
    skipWorkspace: true,
    body: JSON.stringify(payload),
  })
}

export function fetchProfile() {
  return request('/dashboard/profile')
}

export function fetchCrmLeads() {
  return request('/crm/leads')
}


function getFilenameFromContentDisposition(contentDisposition) {
  if (!contentDisposition) return ''

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1].trim().replace(/^\"|\"$/g, ''))
    } catch (_error) {
      return encodedMatch[1].trim().replace(/^\"|\"$/g, '')
    }
  }

  const plainMatch = contentDisposition.match(/filename=(\"[^\"]+\"|[^;]+)/i)
  return plainMatch?.[1]?.trim().replace(/^\"|\"$/g, '') || ''
}

export function fetchCrmMeeting(meetingId) {
  return request(`/crm/meetings/${meetingId}`)
}

export async function downloadCrmMeetingIcs(meetingId) {
  const token = getAuthToken()
  if (!token) throw new Error('Не найден bearer‑токен авторизации')

  const response = await fetch(`${API_BASE_URL}/crm/meetings/${meetingId}/ics`, {
    headers: buildHeaders({ headers: { Authorization: `Bearer ${token}` } }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const backendMessage = data.message || data.details || data.error
    throw new Error(translateApiError(backendMessage || 'Не удалось скачать ICS'))
  }
  const blob = await response.blob()
  const filename = getFilenameFromContentDisposition(response.headers.get('Content-Disposition')) || 'as6-demo-meeting.ics'
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function fetchCrmStages() {
  return request('/crm/stages')
}

export function updateCrmStage(status, payload) {
  return request(`/crm/stages/${status}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function createCrmLead(payload) {
  return request('/crm/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCrmLead(id, payload) {
  return request(`/crm/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}


export function deleteCrmLead(id) {
  return request(`/crm/leads/${id}`, { method: 'DELETE' })
}

export function createCrmFollowUp(id) {
  return request(`/crm/leads/${id}/followups`, { method: 'POST' })
}

export function analyzeCrmLeadAi(id) {
  return request(`/crm/leads/${id}/ai-analysis`, { method: 'POST' })
}

export function runCrmLeadScoringForLead(id) {
  return request(`/crm/leads/${id}/lead-scoring`, { method: 'POST' })
}

export function analyzeCrmWorkspaceAi(payload = {}) {
  return request('/crm/ai-analysis', { method: 'POST', body: JSON.stringify(payload) })
}

export function runCrmLeadScoring(payload = {}) {
  return request('/crm/lead-scoring/run', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchAiRevenueIntelligence() {
  return request('/ai/revenue-intelligence')
}

export function getRevenueIntelligence() {
  return fetchAiRevenueIntelligence()
}

export function getLeadScores(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/revenue-intelligence/lead-scores${query ? `?${query}` : ''}`)
}

export function generateAiRevenueForecast(payload = {}) {
  return request('/ai/revenue-intelligence/forecast', { method: 'POST', body: JSON.stringify(payload) })
}

export function scheduleAiRevenueIntelligence(payload = {}) {
  return request('/ai/revenue-intelligence/schedule', { method: 'POST', body: JSON.stringify(payload) })
}

export async function triggerRevenueAnalysis(payload = {}) {
  const scheduled = await scheduleAiRevenueIntelligence(payload)
  const forecast = await generateAiRevenueForecast(payload.forecastPeriod ? { forecastPeriod: payload.forecastPeriod } : {})
  return { scheduled: scheduled.scheduled, forecast: forecast.forecast }
}

export function analyzeAiRevenueLead(leadId) {
  return request(`/ai/revenue-intelligence/leads/${leadId}/analyze`, { method: 'POST' })
}


export function fetchAiVoiceCalls(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/voice/calls${query ? `?${query}` : ''}`)
}

export function createAiVoiceCall(payload = {}) {
  return request('/ai/voice/call', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchAiVoiceCall(id) {
  return request(`/ai/voice/calls/${id}`)
}


export function fetchRealtimeVoiceSessions(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/realtime-voice/sessions${query ? `?${query}` : ''}`)
}

export function createRealtimeVoiceSession(payload = {}) {
  return request('/ai/realtime-voice/session', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchRealtimeVoiceSession(id) {
  return request(`/ai/realtime-voice/sessions/${id}`)
}

export function createLiveStreamSession(payload = {}) {
  return request('/ai/live-stream/session', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchLiveStreamSessions() {
  return request('/ai/live-stream/sessions')
}

export function fetchLiveStreamSession(id) {
  return request(`/ai/live-stream/sessions/${id}`)
}

export function fetchLiveStreamSessionEvents(id) {
  return request(`/ai/live-stream/sessions/${id}/events`)
}

export function startLiveStreamSession(payload = {}) {
  return createLiveStreamSession(payload)
}

export function getLiveStreamEvents(sessionId) {
  return fetchLiveStreamSessionEvents(sessionId)
}

export function createLiveStreamEventSource(sessionId) {
  const workspaceId = getActiveWorkspaceId()
  const qs = new URLSearchParams()
  if (workspaceId) qs.set('workspaceId', workspaceId)
  return request(`/ai/live-stream/sessions/${sessionId}/stream-token${qs.toString() ? `?${qs.toString()}` : ''}`, { method: 'POST' })
    .then(({ token }) => {
      const params = new URLSearchParams()
      params.set('streamToken', token)
      return new EventSource(`${API_BASE_URL}/ai/live-stream/sessions/${sessionId}/stream?${params.toString()}`)
    })
}

export function fetchCrmActivity() {
  return request('/crm/activity')
}

export function addCrmLeadNote(id, body) {
  return request(`/crm/leads/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export function fetchCrmStats() {
  return request('/crm/stats')
}

export function seedDemoSalesPipeline() {
  return request('/demo/seed-sales-pipeline', { method: 'POST' })
}

export function fetchAiTasks() {
  return request('/ai/tasks')
}

export function fetchAiTask(id) {
  return request(`/ai/tasks/${id}`)
}

export function createAiTask(payload) {
  return request('/ai/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}


export function getActiveAiSequences() {
  return request('/ai/sequences/active')
}

export function startAiSequence({ leadId, templateId, workspaceId } = {}) {
  return request('/ai/sequences/start', {
    method: 'POST',
    workspaceId,
    body: JSON.stringify({ leadId, templateId: templateId || undefined, workspaceId: workspaceId || undefined }),
  })
}

export function pauseAiSequence(sequenceId) {
  return request('/ai/sequences/pause', {
    method: 'POST',
    body: JSON.stringify({ sequenceId }),
  })
}

export function stopAiSequence(sequenceId) {
  return request('/ai/sequences/stop', {
    method: 'POST',
    body: JSON.stringify({ sequenceId }),
  })
}

export function fetchAiWorkers() {
  return request('/ai/workers')
}

export function createAiWorker(payload) {
  return request('/ai/workers', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateAiWorker(id, payload) {
  return request(`/ai/workers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function fetchAiWorkerRuns(id) {
  return request(`/ai/workers/${id}/runs`)
}

export function runAiWorker(id) {
  return request(`/ai/workers/${id}/run`, { method: 'POST' })
}

export function fetchAiCommandCenter() {
  return request('/ai/command-center')
}

export function fetchAiWorkersFocusSummary(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai-workers/focus-summary${query ? `?${query}` : ''}`)
}

export function fetchAiPipelineCopilot() {
  return request('/ai/pipeline-copilot')
}

export function fetchAiManagerDashboard(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/manager-dashboard${query ? `?${query}` : ''}`)
}

export function createPipelineCopilotFollowupAction(payload) {
  return request('/ai/pipeline-copilot/actions/followup', { method: 'POST', body: JSON.stringify(payload) })
}

export function createPipelineCopilotMeetingAction(payload) {
  return request('/ai/pipeline-copilot/actions/meeting', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchAiPriorityInbox(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/priority-inbox${query ? `?${query}` : ''}`)
}

export function createPriorityInboxAction(payload) {
  return request('/ai/priority-inbox/actions', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchAiApprovalQueue(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/approval-queue${query ? `?${query}` : ''}`)
}

export function approveAiApprovalQueueItem(id, options = {}) {
  return request(`/ai/approval-queue/${id}/approve`, { ...options, method: 'POST' })
}

export function rejectAiApprovalQueueItem(id, options = {}) {
  return request(`/ai/approval-queue/${id}/reject`, { ...options, method: 'POST' })
}

export function updateAiApprovalQueueItem(id, payload, options = {}) {
  return request(`/ai/approval-queue/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(payload) })
}

export function executeAiApprovalQueueItem(id, options = {}) {
  return request(`/ai/approval-queue/${id}/execute`, { ...options, method: 'POST' })
}



export function fetchAiApprovalCenterQueue(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/approval-center/queue${query ? `?${query}` : ''}`)
}

export function approveAiApprovalCenterItem(id, payload = {}) {
  return request(`/ai/approval-center/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) })
}

export function rejectAiApprovalCenterItem(id, payload = {}) {
  return request(`/ai/approval-center/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) })
}

export function snoozeAiApprovalCenterItem(id, payload = {}) {
  return request(`/ai/approval-center/${id}/snooze`, { method: 'POST', body: JSON.stringify(payload) })
}

export function escalateAiApprovalCenterItem(id, payload = {}) {
  return request(`/ai/approval-center/${id}/escalate`, { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchAiWorkforceAgents() { return request('/ai/workforce/agents') }
export function fetchAiWorkforceTasks() { return request('/ai/workforce/tasks') }
export function fetchAiWorkforceAssignments() { return request('/ai/workforce/assignments') }
export function fetchAiWorkforceExecutionPlans() { return request('/ai/workforce/execution-plans') }
export function fetchAiWorkforceMetrics() { return request('/ai/workforce/metrics') }
export function fetchAiWorkforceEvents() { return request('/ai/workforce/events') }
export function fetchAiWorkforceActivityStream() { return request('/ai/workforce/activity-stream') }
export function fetchAiWorkforceRealtimeMetrics() { return request('/ai/workforce/realtime-metrics') }
export function fetchAiWorkforceRealtimeMetricsHistory(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/workforce/realtime-metrics/history${query ? `?${query}` : ''}`)
}
export function simulateAiWorkforceActivity() { return request('/ai/workforce/simulate-activity', { method: 'POST', body: JSON.stringify({}) }) }
export function fetchAiWorkforceCommandGraph(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString()
  return request(`/ai/workforce/command-graph${query ? `?${query}` : ''}`)
}

export function fetchTelegramMessages(leadId) {
  return request(`/crm/leads/${leadId}/telegram-messages`)
}

export function sendTelegramLeadMessage(leadId, message) {
  return request(`/crm/leads/${leadId}/telegram-messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export function fetchEmailTemplates() {
  return request('/email/templates')
}

export function uploadEmailAttachment(payload) {
  return request('/email/attachments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchLeadEmails(leadId) {
  return request(`/crm/leads/${leadId}/emails`)
}

export function generateLeadEmail(leadId, payload) {
  return request(`/crm/leads/${leadId}/emails/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function sendLeadEmail(leadId, payload) {
  return request(`/crm/leads/${leadId}/emails`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchAiAgentActions(leadId) {
  return request(`/ai/agents/actions${leadId ? `?leadId=${encodeURIComponent(leadId)}` : ''}`)
}

export function createAiAgentAction(payload) {
  return request('/ai/agents/actions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function queueInactiveAiFollowUps(payload = {}) {
  return request('/ai/agents/followups/queue-inactive', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchAiAgentMetrics() {
  return request('/ai/agents/metrics')
}

export function fetchWorkspaces() {
  return request('/workspaces')
}

export function createWorkspace(payload) {
  return request('/workspaces', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchCurrentWorkspace() {
  return request('/workspaces/current')
}

export function updateWorkspace(id, payload) {
  return request(`/workspaces/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function addWorkspaceMember(id, payload) {
  return request(`/workspaces/${id}/members`, { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchMaterials() {
  return request('/execution/materials')
}

export function fetchLeadActionCenter(leadId) {
  return request(`/execution/crm/leads/${leadId}/action-center`)
}

export function createLeadAiAction(leadId, payload) {
  return request(`/execution/crm/leads/${leadId}/actions`, { method: 'POST', body: JSON.stringify(payload) })
}

export function updateLeadAiAction(actionId, payload) {
  return request(`/execution/crm/actions/${actionId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function approveLeadAiAction(actionId) {
  return request(`/execution/crm/actions/${actionId}/approve`, { method: 'POST' })
}

export function cancelLeadAiAction(actionId) {
  return request(`/execution/crm/actions/${actionId}/cancel`, { method: 'POST' })
}

export function sendLeadAiAction(actionId) {
  return request(`/execution/crm/actions/${actionId}/send`, { method: 'POST' })
}

export function sendLeadMaterials(leadId, payload) {
  return request(`/execution/leads/${leadId}/attachments/send`, { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchAiFollowups() {
  return request('/ai/followups')
}

export function runAiFollowupScan() {
  return request('/ai/followups/run-scan', { method: 'POST' })
}

export function updateAiFollowup(id, payload) {
  return request(`/ai/followups/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function approveAiFollowup(id) {
  return request(`/ai/followups/${id}/approve`, { method: 'POST' })
}

export function rejectAiFollowup(id) {
  return request(`/ai/followups/${id}/reject`, { method: 'POST' })
}

export function sendAiFollowup(id) {
  return request(`/ai/followups/${id}/send`, { method: 'POST', timeoutMs: 20000 })
}

export function createOpenAiRealtimeEphemeralSession(payload = {}) {
  return request('/ai/openai-realtime/ephemeral-session', { method: 'POST', body: JSON.stringify(payload) })
}

export function getOpenAiRealtimeSession(sessionId) {
  return request(`/ai/openai-realtime/session/${sessionId}`)
}

export function refreshOpenAiRealtimeSession(sessionId, payload = {}) {
  return request(`/ai/openai-realtime/session/${sessionId}/refresh`, { method: 'POST', body: JSON.stringify(payload) })
}

export function createOpenAiRealtimeAudioSandboxSession(payload = {}) {
  return request('/ai/openai-realtime/audio-sandbox/session', { method: 'POST', body: JSON.stringify(payload) })
}

export function stopOpenAiRealtimeAudioSandboxSession(sessionId) {
  return request(`/ai/openai-realtime/audio-sandbox/session/${sessionId}/stop`, { method: 'POST' })
}

export function createOpenAiRealtimeAudioPilotSession(payload = {}) {
  return request('/ai/openai-realtime/audio-pilot/session', { method: 'POST', body: JSON.stringify(payload) })
}

export function stopOpenAiRealtimeAudioPilotSession(sessionId) {
  return request(`/ai/openai-realtime/audio-pilot/session/${sessionId}/stop`, { method: 'POST' })
}

export function fetchAiExecutionQueue() {
  return request('/ai/execution/queue', { method: 'GET' })
}

export function executeAiExecution(id) {
  return request(`/ai/execution/${id}/execute`, { method: 'POST' })
}

export function cancelAiExecution(id) {
  return request(`/ai/execution/${id}/cancel`, { method: 'POST' })
}

export function fetchAiExecutionRuns() {
  return request('/ai/execution/runs', { method: 'GET' })
}

export function fetchAiRevenueEngineSnapshot() { return request('/ai/revenue-engine/snapshot') }
export function fetchAiRevenueEngineRecommendations() { return request('/ai/revenue-engine/recommendations') }
export function fetchAiRevenueEngineRisks() { return request('/ai/revenue-engine/risks') }
export function runAiRevenueEngineAnalysis() { return request('/ai/revenue-engine/run-analysis', { method: 'POST', body: JSON.stringify({}) }) }

export function fetchAiExecutiveSnapshot(){return request('/ai/executive-brain/snapshot')}
export function fetchAiExecutiveRecommendations(){return request('/ai/executive-brain/recommendations')}
export function fetchAiExecutiveRisks(){return request('/ai/executive-brain/risks')}
export function fetchAiExecutiveOrganizationalHealth(){return request('/ai/executive-brain/organizational-health')}
export function runAiExecutiveAnalysis(){return request('/ai/executive-brain/run-analysis',{method:'POST',body:JSON.stringify({})})}


export function runAiCompanySimulation(payload={}){return request('/ai/company-simulation/run',{method:'POST',body:JSON.stringify(payload)})}
export function fetchAiCompanySimulationRuns(){return request('/ai/company-simulation/runs')}
export function fetchAiCompanySimulationScenarios(){return request('/ai/company-simulation/scenarios')}
export function fetchAiCompanySimulationResults(){return request('/ai/company-simulation/results')}
export function fetchAiCompanySimulationRisks(){return request('/ai/company-simulation/risks')}

export function runAiStrategicPlanning(){return request('/ai/strategic-planning/run',{method:'POST',body:JSON.stringify({})})}
export function fetchAiStrategicPlans(){return request('/ai/strategic-planning/plans')}
export function fetchAiStrategicOkrs(){return request('/ai/strategic-planning/okrs')}
export function fetchAiStrategicInitiatives(){return request('/ai/strategic-planning/initiatives')}
export function fetchAiStrategicDependencyGraph(){return request('/ai/strategic-planning/dependency-graph')}
export function fetchAiStrategicResourceAllocation(){return request('/ai/strategic-planning/resource-allocation')}


export function runAiEnterpriseCoordination(){return request('/ai/enterprise-coordination/run',{method:'POST',body:JSON.stringify({})})}
export function fetchAiEnterpriseRuns(){return request('/ai/enterprise-coordination/runs')}
export function fetchAiEnterpriseSynchronization(){return request('/ai/enterprise-coordination/synchronization')}
export function fetchAiEnterpriseRoutes(){return request('/ai/enterprise-coordination/routes')}
export function fetchAiEnterpriseConflicts(){return request('/ai/enterprise-coordination/conflicts')}
export function fetchAiEnterpriseEscalations(){return request('/ai/enterprise-coordination/escalations')}


export function runAiOrganizationalMemory(){return request('/ai/organizational-memory/run',{method:'POST',body:JSON.stringify({})})}
export function fetchAiOrganizationalSnapshot(){return request('/ai/organizational-memory/snapshot')}
export function fetchAiOrganizationalLineage(){return request('/ai/organizational-memory/lineage')}
export function fetchAiOrganizationalTimeline(){return request('/ai/organizational-memory/timeline')}
export function fetchAiOrganizationalDrift(){return request('/ai/organizational-memory/drift')}
export function fetchAiOrganizationalLearning(){return request('/ai/organizational-memory/learning')}

export function fetchAiExecutiveUnifiedOverview(){return request('/ai/executive-dashboard/overview')}

export function fetchAiSystemHealth() { return request('/ai/system-health') }
export function fetchAiCommandCenterOverview(){return request('/ai/command-center/overview')}
export function fetchAiCommandCenterTimeline(){return request('/ai/command-center/timeline')}

export function fetchAiCommandCenterActions(){return request('/ai/command-center/actions')}
export function fetchAiCommandCenterInbox(){return request('/ai/command-center/inbox')}
export function requestAiCommandCenterAction(payload){return request('/ai/command-center/actions/request',{method:'POST',body:JSON.stringify(payload||{})})}
export function approveAiCommandCenterAction(id,payload={}){return request(`/ai/command-center/actions/${id}/approve`,{method:'POST',body:JSON.stringify(payload)})}
export function rejectAiCommandCenterAction(id,payload={}){return request(`/ai/command-center/actions/${id}/reject`,{method:'POST',body:JSON.stringify(payload)})}
export function fetchAiCommandCenterActionAudit(id){return request(`/ai/command-center/actions/${id}/audit`)}
