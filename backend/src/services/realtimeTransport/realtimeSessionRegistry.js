const sessions = new Map()
const nowIso = () => new Date().toISOString()
function registerSession(session) { const id = session?.id || session?.realtimeSessionId; if (!id) throw new Error('session id is required'); const next = { ...session, id, updatedAt: nowIso(), createdAt: session.createdAt || nowIso() }; sessions.set(id, next); return next }
function getSession(sessionId) { return sessions.get(sessionId) || null }
function updateSession(sessionId, patch = {}) { const current = getSession(sessionId); if (!current) return null; const next = { ...current, ...patch, updatedAt: nowIso() }; sessions.set(sessionId, next); return next }
function listSessions() { return Array.from(sessions.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) }
function removeSession(sessionId) { return sessions.delete(sessionId) }
function clearSessions() { sessions.clear() }
module.exports = { registerSession, getSession, updateSession, listSessions, removeSession, clearSessions }
