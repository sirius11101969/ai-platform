const STATES = Object.freeze({
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  INTERRUPTED: 'interrupted',
  RECONNECTING: 'reconnecting',
  COMPLETED: 'completed',
  FAILED: 'failed',
})

const TRANSITIONS = Object.freeze({
  [STATES.IDLE]: new Set([STATES.LISTENING, STATES.FAILED]),
  [STATES.LISTENING]: new Set([STATES.PROCESSING, STATES.INTERRUPTED, STATES.RECONNECTING, STATES.COMPLETED, STATES.FAILED]),
  [STATES.PROCESSING]: new Set([STATES.SPEAKING, STATES.INTERRUPTED, STATES.RECONNECTING, STATES.FAILED]),
  [STATES.SPEAKING]: new Set([STATES.INTERRUPTED, STATES.LISTENING, STATES.COMPLETED, STATES.FAILED]),
  [STATES.INTERRUPTED]: new Set([STATES.LISTENING, STATES.PROCESSING, STATES.SPEAKING, STATES.RECONNECTING, STATES.COMPLETED, STATES.FAILED]),
  [STATES.RECONNECTING]: new Set([STATES.LISTENING, STATES.PROCESSING, STATES.FAILED]),
  [STATES.COMPLETED]: new Set([]),
  [STATES.FAILED]: new Set([]),
})

const DB_STATUS_BY_STATE = Object.freeze({
  [STATES.IDLE]: 'initializing',
  [STATES.LISTENING]: 'listening',
  [STATES.PROCESSING]: 'listening',
  [STATES.SPEAKING]: 'speaking',
  [STATES.INTERRUPTED]: 'interrupted',
  [STATES.RECONNECTING]: 'interrupted',
  [STATES.COMPLETED]: 'completed',
  [STATES.FAILED]: 'failed',
})

function createRealtimeVoiceStateMachine(initialState = STATES.IDLE) {
  if (!Object.values(STATES).includes(initialState)) {
    throw Object.assign(new Error(`Invalid realtime voice state: ${initialState}`), { statusCode: 400 })
  }

  let state = initialState
  const history = [{ state, at: new Date().toISOString(), reason: 'initial' }]

  function canTransition(nextState) {
    return Boolean(TRANSITIONS[state]?.has(nextState))
  }

  function transition(nextState, metadata = {}) {
    if (!Object.values(STATES).includes(nextState)) {
      throw Object.assign(new Error(`Invalid realtime voice state: ${nextState}`), { statusCode: 400 })
    }
    if (!canTransition(nextState)) {
      throw Object.assign(new Error(`Invalid realtime voice transition from ${state} to ${nextState}`), { statusCode: 409, fromState: state, toState: nextState })
    }
    const previousState = state
    state = nextState
    const entry = { state, previousState, at: new Date().toISOString(), ...metadata }
    history.push(entry)
    return entry
  }

  return {
    get state() { return state },
    get history() { return [...history] },
    canTransition,
    transition,
    toPersistenceStatus() { return DB_STATUS_BY_STATE[state] || 'failed' },
  }
}

module.exports = { STATES, TRANSITIONS, DB_STATUS_BY_STATE, createRealtimeVoiceStateMachine }
