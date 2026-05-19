const pool = require('../../db/pool')
const { addTimelineEvent } = require('../timelineService')
const aiRevenueIntelligenceService = require('../aiRevenueIntelligenceService')
const { liveRealtimeStreamBus } = require('./liveRealtimeStreamBus')
const { appendTranscript, computeLatency } = require('./liveRealtimeTranscriptService')
const { summarizeLeadContext } = require('../aiSalesBrain/leadContextAssembler')
const { detectObjection } = require('../aiSalesBrain/objectionHandlingEngine')
const { detectMeetingIntent } = require('../aiSalesBrain/meetingIntentDetector')
const { suggestCrmActions } = require('../aiSalesBrain/crmActionSuggestionEngine')

const FLOW = ['session_started','user_audio_chunk_simulated','partial_transcript','ai_thinking','ai_response_chunk','interruption_detected','resume_listening','final_transcript','completed']
const safeJson = (v) => JSON.stringify(v || {})

async function persistEvent(sessionId, eventType, payload = {}) {
  const result = await pool.query('INSERT INTO ai_live_stream_events(session_id,event_type,payload) VALUES($1::uuid,$2::text,$3::jsonb) RETURNING *', [sessionId, eventType, safeJson(payload)])
  return normalizeEvent(result.rows[0])
}

function normalizeSession(r){ if(!r) return null; return { id:r.id, workspaceId:r.workspace_id, leadId:r.lead_id, realtimeVoiceSessionId:r.realtime_voice_session_id, status:r.status, streamMode:r.stream_mode, simulationSafety:r.simulation_safety||{}, metadata:r.metadata||{}, latencyMs:r.latency_ms||0, createdAt:r.created_at, startedAt:r.started_at, completedAt:r.completed_at } }
function normalizeEvent(r){ if(!r) return null; return { id:r.id, sessionId:r.session_id, eventType:r.event_type, payload:r.payload||{}, createdAt:r.created_at } }

async function createSession({workspaceId,leadId,userId}){
  const result = await pool.query("INSERT INTO ai_live_stream_sessions(workspace_id,lead_id,status,stream_mode,simulation_safety,metadata,started_at) VALUES($1::uuid,$2::uuid,'starting','sse',$3::jsonb,$4::jsonb,NOW()) RETURNING *", [workspaceId, leadId || null, safeJson({simulationMode:true,noMicrophone:true,noOpenAiAudio:true,noTelephony:true}), safeJson({ transcript: [] })])
  const session = normalizeSession(result.rows[0])
  await addTimelineEvent(pool,{workspaceId,leadId:leadId||null,userId,eventType:'live_stream_started',title:'Live stream simulation started',body:'Simulation only: no real microphone, telephony, or OpenAI audio.',source:'ai',metadata:{sessionId:session.id,mockMode:true}}).catch(()=>null)
  runSimulation({sessionId:session.id,workspaceId,leadId,userId}).catch(()=>null)
  return session
}

async function runSimulation({sessionId,workspaceId,leadId,userId}){
  let transcript=[]; const events=[]
  const leadContext = summarizeLeadContext({ crmLead:{ name:'Sample Lead', company:'Sample Co', stage:'qualified' }, leadScore:88, revenueForecast:{ band:'growth' }, activityHistory:[{type:'recent_call'}], outreachHistory:[{outcome:'replied'}], realtimeMetadata:{sessionId,channel:'sse'} })
  for (const eventType of FLOW){
    const payload = { text: eventType.replaceAll('_',' '), simulationMode: true }
    if (eventType.includes('transcript') || eventType.includes('response')) transcript = appendTranscript(transcript, { role: eventType.includes('ai')?'assistant':'user', text: payload.text })
    const event = await persistEvent(sessionId,eventType,{...payload, transcriptChunk: transcript.at(-1) || null})
    events.push(event)
    liveRealtimeStreamBus.publish(sessionId,event)
  }
  const leadSignal = await persistEvent(sessionId,'lead_signal_detected',{ leadContext: leadContext.safeSummary });
  events.push(leadSignal); liveRealtimeStreamBus.publish(sessionId, leadSignal)
  const objection = detectObjection('Your pricing seems expensive and we may wait until next quarter')
  if (objection) {
    const objectionEvent = await persistEvent(sessionId,'objection_detected',{ objection, safeContext: leadContext.safeSummary })
    events.push(objectionEvent); liveRealtimeStreamBus.publish(sessionId, objectionEvent)
  }
  const meetingIntent = detectMeetingIntent('Can we book a demo and send pricing?')
  if (meetingIntent) {
    const meetingEvent = await persistEvent(sessionId,'meeting_interest_detected',{ meetingIntent })
    events.push(meetingEvent); liveRealtimeStreamBus.publish(sessionId, meetingEvent)
  }
  const pricingEvent = await persistEvent(sessionId,'pricing_interest_detected',{ knowledgeHint:'planComparison' })
  events.push(pricingEvent); liveRealtimeStreamBus.publish(sessionId, pricingEvent)
  const actions = suggestCrmActions({ objection, meetingIntent, leadScore: leadContext.safeSummary.leadScore, pricingInterest: true })
  for (const action of actions) {
    const actionEvent = await persistEvent(sessionId,'crm_action_suggested',{ action, requiresExplicitUserAction:true })
    events.push(actionEvent); liveRealtimeStreamBus.publish(sessionId, actionEvent)
  }
  const sentimentEvent = await persistEvent(sessionId,'sentiment_shift_detected',{ from:'neutral', to:'positive', reason:'demo_interest' })
  events.push(sentimentEvent); liveRealtimeStreamBus.publish(sessionId, sentimentEvent)

  const latencyMs = computeLatency(events) || 120
  await pool.query("UPDATE ai_live_stream_sessions SET status='completed', latency_ms=$2::integer, completed_at=NOW(), metadata=metadata || $3::jsonb WHERE id=$1::uuid", [sessionId,latencyMs,safeJson({ transcript, interruptionDetected:true, futureTransport:'websocket' })])
  if (workspaceId && leadId) await aiRevenueIntelligenceService.analyzeLeadRevenueIntelligence({ workspaceId, userId, leadId, client: pool }).catch(()=>null)
}

async function listSessions({workspaceId}){ const r = await pool.query('SELECT * FROM ai_live_stream_sessions WHERE workspace_id=$1::uuid ORDER BY created_at DESC LIMIT 100',[workspaceId]); return r.rows.map(normalizeSession) }
async function getSession({workspaceId,sessionId}){ const s = await pool.query('SELECT * FROM ai_live_stream_sessions WHERE workspace_id=$1::uuid AND id=$2::uuid LIMIT 1',[workspaceId,sessionId]); const session = normalizeSession(s.rows[0]); if(!session) return null; const e = await pool.query('SELECT * FROM ai_live_stream_events WHERE session_id=$1::uuid ORDER BY created_at ASC',[sessionId]); return { ...session, events:e.rows.map(normalizeEvent) } }
async function getSessionById({sessionId}){ const s = await pool.query('SELECT * FROM ai_live_stream_sessions WHERE id=$1::uuid LIMIT 1',[sessionId]); const session = normalizeSession(s.rows[0]); if(!session) return null; const e = await pool.query('SELECT * FROM ai_live_stream_events WHERE session_id=$1::uuid ORDER BY created_at ASC',[sessionId]); return { ...session, events:e.rows.map(normalizeEvent) } }
async function getSessionEvents({workspaceId,sessionId}){ const s = await pool.query('SELECT 1 FROM ai_live_stream_sessions WHERE workspace_id=$1::uuid AND id=$2::uuid LIMIT 1',[workspaceId,sessionId]); if(!s.rowCount) return null; const e = await pool.query('SELECT * FROM ai_live_stream_events WHERE session_id=$1::uuid ORDER BY created_at ASC',[sessionId]); return e.rows.map(normalizeEvent) }

module.exports = { createSession, listSessions, getSession, getSessionById, getSessionEvents }
