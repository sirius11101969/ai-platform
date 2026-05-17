const crypto = require('crypto')

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

function getGoogleCalendarConfig() {
  const enabled = String(process.env.GOOGLE_CALENDAR_ENABLED || 'false').toLowerCase() === 'true'
  const calendarId = String(process.env.GOOGLE_CALENDAR_ID || '').trim()
  const clientEmail = String(process.env.GOOGLE_CLIENT_EMAIL || '').trim()
  const privateKey = String(process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim()
  const projectId = String(process.env.GOOGLE_PROJECT_ID || '').trim()
  return { enabled, calendarId, clientEmail, privateKey, projectId }
}

function isGoogleCalendarConfigured(config = getGoogleCalendarConfig()) {
  return Boolean(config.enabled && config.calendarId && config.clientEmail && config.privateKey && config.projectId)
}

function base64Url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function signJwt(config) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: config.clientEmail,
    scope: GOOGLE_CALENDAR_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(config.privateKey)
  return `${unsigned}.${base64Url(signature)}`
}

async function getAccessToken(config) {
  const assertion = signJwt(config)
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error_description || data.error || `Google token request failed (${response.status})`)
  if (!data.access_token) throw new Error('Google token response did not include access_token')
  return data.access_token
}

function buildGoogleEvent({ meeting, requestId }) {
  const startsAt = meeting.startsAt ? new Date(meeting.startsAt) : new Date()
  const durationMinutes = Number.isFinite(Number(meeting.durationMinutes)) && Number(meeting.durationMinutes) > 0 ? Number(meeting.durationMinutes) : 30
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000)
  const timeZone = meeting.timezone || 'Europe/Moscow'
  return {
    summary: meeting.title || 'Demo-созвон AS6',
    description: meeting.description || '',
    location: meeting.location || 'Google Meet',
    start: { dateTime: startsAt.toISOString(), timeZone },
    end: { dateTime: endsAt.toISOString(), timeZone },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }
}

async function createGoogleCalendarEvent({ meeting }) {
  const config = getGoogleCalendarConfig()
  if (!isGoogleCalendarConfigured(config)) {
    console.info('[calendar] google disabled, using ics fallback')
    return { skipped: true, reason: 'google_calendar_disabled_or_missing_credentials' }
  }
  const accessToken = await getAccessToken(config)
  const requestId = `as6-${meeting.id}`.replace(/[^a-zA-Z0-9_-]/g, '-')
  const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(config.calendarId)}/events?conferenceDataVersion=1`
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGoogleEvent({ meeting, requestId })),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error?.message || `Google Calendar event create failed (${response.status})`)
  const meetUrl = data.hangoutLink || (data.conferenceData?.entryPoints || []).find((entry) => entry.entryPointType === 'video')?.uri || ''
  console.info('[calendar] google event created', { meetingId: meeting.id, googleEventId: data.id })
  return { skipped: false, googleEventId: data.id, googleMeetUrl: meetUrl, raw: data }
}

module.exports = { createGoogleCalendarEvent, getGoogleCalendarConfig, isGoogleCalendarConfigured }
