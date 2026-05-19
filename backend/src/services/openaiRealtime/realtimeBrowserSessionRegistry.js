const sessions = new Map()

function now() { return new Date().toISOString() }

function create(session) { sessions.set(session.id, { ...session, createdAt: session.createdAt || now(), updatedAt: now() }); return sessions.get(session.id) }
function get(id) { return sessions.get(id) || null }
function update(id, patch = {}) { const curr = sessions.get(id); if (!curr) return null; const next = { ...curr, ...patch, updatedAt: now() }; sessions.set(id, next); return next }
function consumeReplayNonce(nonce) { if (!nonce) return false; for (const s of sessions.values()) { if (s.usedNonces?.has(nonce)) return false }
  return true }
function markReplayNonce(id, nonce) { const s = sessions.get(id); if (!s) return; s.usedNonces = s.usedNonces || new Set(); s.usedNonces.add(nonce); s.updatedAt = now() }

module.exports = { create, get, update, consumeReplayNonce, markReplayNonce }
