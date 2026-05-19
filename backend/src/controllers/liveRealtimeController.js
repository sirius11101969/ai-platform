const gateway = require('../services/liveRealtime/liveRealtimeGateway')
const { sign, verify } = require('../services/tokenService')

const safety = { simulationMode: true, noMicrophone: true, noOpenAiAudioStreaming: true, noTelephony: true }

async function createSession(req,res,next){ try{ const session=await gateway.createSession({workspaceId:req.workspace.id,leadId:req.body?.leadId||null,userId:req.user?.id||null}); res.status(201).json({session,safety}) }catch(e){next(e)} }
async function listSessions(req,res,next){ try{ const sessions=await gateway.listSessions({workspaceId:req.workspace.id}); res.json({sessions,safety}) }catch(e){next(e)} }
async function getSession(req,res,next){ try{ const session=await gateway.getSession({workspaceId:req.workspace.id,sessionId:req.params.id}); if(!session) return res.status(404).json({error:'Live stream session not found'}); res.json({session,safety}) }catch(e){next(e)} }
async function getSessionEvents(req,res,next){ try{ const events=await gateway.getSessionEvents({workspaceId:req.workspace.id,sessionId:req.params.id}); if(!events) return res.status(404).json({error:'Live stream session not found'}); res.json({events,safety}) }catch(e){next(e)} }
async function createStreamToken(req,res,next){
  try {
    const payload = { typ:'live_stream_sse', workspaceId:req.workspace.id, sessionId:req.params.id, userId:req.user?.id || null, exp: Math.floor(Date.now()/1000) + 60 * 5 }
    const token = sign(payload)
    res.json({ token, expiresInSeconds: 300, safety })
  } catch (e) { next(e) }
}

async function streamSession(req,res,next){
  try {
    let workspaceId = req.workspace?.id || null
    const token = req.query?.streamToken
    if (!workspaceId && token) {
      const decoded = verify(token)
      if (decoded?.typ !== 'live_stream_sse' || decoded?.sessionId !== req.params.id) return res.status(401).json({ error:'Invalid live stream token' })
      workspaceId = decoded.workspaceId
    }
    if (!workspaceId) return res.status(401).json({ error:'Unauthorized stream access' })
    const session = await gateway.getSession({ workspaceId, sessionId:req.params.id })
    if (!session) return res.status(404).json({ error:'Live stream session not found' })
    res.setHeader('Content-Type','text/event-stream')
    res.setHeader('Cache-Control','no-cache')
    res.setHeader('Connection','keep-alive')
    res.flushHeaders?.()
    const send = (event) => res.write(`event: live_stream_event\ndata: ${JSON.stringify(event)}\n\n`)
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 10000)
    const doneIfCompleted = (event) => {
      if (event?.eventType === 'completed') {
        clearInterval(heartbeat)
        unsubLive()
        res.end()
      }
    }
    session.events.forEach((event) => { send(event); doneIfCompleted(event) })
    if (session.status === 'completed') return res.end()
    const wrappedSend = (event) => { send(event); doneIfCompleted(event) }
    const unsubLive = gateway.liveRealtimeStreamBus.subscribe(req.params.id, wrappedSend)
    req.on('close', () => { clearInterval(heartbeat); unsubLive(); res.end() })
  } catch (e) { next(e) }
}

module.exports = { createSession, listSessions, getSession, getSessionEvents, createStreamToken, streamSession }
