const gateway = require('../services/liveRealtime/liveRealtimeGateway')

const safety = { simulationMode: true, noMicrophone: true, noOpenAiAudioStreaming: true, noTelephony: true }

async function createSession(req,res,next){ try{ const session=await gateway.createSession({workspaceId:req.workspace.id,leadId:req.body?.leadId||null,userId:req.user?.id||null}); res.status(201).json({session,safety}) }catch(e){next(e)} }
async function listSessions(req,res,next){ try{ const sessions=await gateway.listSessions({workspaceId:req.workspace.id}); res.json({sessions,safety}) }catch(e){next(e)} }
async function getSession(req,res,next){ try{ const session=await gateway.getSession({workspaceId:req.workspace.id,sessionId:req.params.id}); if(!session) return res.status(404).json({error:'Live stream session not found'}); res.json({session,safety}) }catch(e){next(e)} }
async function getSessionEvents(req,res,next){ try{ const events=await gateway.getSessionEvents({workspaceId:req.workspace.id,sessionId:req.params.id}); if(!events) return res.status(404).json({error:'Live stream session not found'}); res.json({events,safety}) }catch(e){next(e)} }

async function streamSession(req,res,next){
  try {
    const session = await gateway.getSession({ workspaceId:req.workspace.id, sessionId:req.params.id })
    if (!session) return res.status(404).json({ error:'Live stream session not found' })
    res.setHeader('Content-Type','text/event-stream')
    res.setHeader('Cache-Control','no-cache')
    res.setHeader('Connection','keep-alive')
    res.flushHeaders?.()
    const send = (event) => res.write(`event: ${event.eventType}\ndata: ${JSON.stringify(event)}\n\n`)
    session.events.forEach(send)
    const unsub = gateway.liveRealtimeStreamBus.subscribe(req.params.id, send)
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15000)
    req.on('close', () => { clearInterval(heartbeat); unsub(); res.end() })
  } catch (e) { next(e) }
}

module.exports = { createSession, listSessions, getSession, getSessionEvents, streamSession }
