const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const AUTH_STORAGE_KEY = 'ai-platform-auth'
const LEGACY_TOKEN_KEYS = ['token', 'jwt', 'accessToken', 'authToken']

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
  }
  if (exact[text]) return exact[text]
  if (text.startsWith('Status must be one of:')) return 'Статус должен быть одним из допустимых этапов CRM'
  if (text.startsWith('Task type must be one of:')) return 'Выберите допустимый тип AI‑задачи'
  if (text.startsWith('Insufficient credits:')) return text.replace(/Insufficient credits: (\d+) credits required/, 'Недостаточно AI‑кредитов: требуется $1')
  return text
}

function buildHeaders(options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  const token = options.skipAuth ? null : getAuthToken()
  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function request(path, options = {}) {
  const { skipAuth, ...fetchOptions } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: buildHeaders(options),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
    }

    const error = new Error(translateApiError(data.error || 'Не удалось выполнить запрос к API'))
    error.status = response.status
    error.payload = data
    throw error
  }

  return data
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

export function fetchProfile() {
  return request('/dashboard/profile')
}

export function fetchCrmLeads() {
  return request('/crm/leads')
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
