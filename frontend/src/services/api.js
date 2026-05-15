const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const AUTH_STORAGE_KEY = 'ai-platform-auth'

function getStoredAuth() {
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || 'null')
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

export function saveAuthSession(session) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function request(path, options = {}) {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

export function signup({ email, password }) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function fetchProfile() {
  return request('/auth/profile')
}

export function fetchCrmLeads() {
  return request('/crm/leads')
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
