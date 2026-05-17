const DEFAULT_TIMEZONE = 'Europe/Moscow'
const ICS_DOMAIN = process.env.ICS_UID_DOMAIN || 'as6.ai'

function pad(value) {
  return String(value).padStart(2, '0')
}

function escapeIcsText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function foldLine(line) {
  const chunks = []
  let current = String(line || '')
  while (current.length > 75) {
    chunks.push(current.slice(0, 75))
    current = ` ${current.slice(75)}`
  }
  chunks.push(current)
  return chunks.join('\r\n')
}

function formatUtcDateTime(date) {
  const value = new Date(date)
  return `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(value.getUTCDate())}T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}${pad(value.getUTCSeconds())}Z`
}

function getZonedParts(date, timeZone = DEFAULT_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  return Object.fromEntries(formatter.formatToParts(new Date(date)).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
}

function formatZonedDateTime(date, timeZone = DEFAULT_TIMEZONE) {
  const parts = getZonedParts(date, timeZone)
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`
}

function buildStableIcsUid({ workspaceId, queueId, meetingId, leadId }) {
  return `as6-${workspaceId || 'workspace'}-${queueId || meetingId || leadId || Date.now()}@${ICS_DOMAIN}`
}

function buildMeetingDescription({ leadName, channel, sourceMessage }) {
  const lines = [
    `Лид: ${leadName || '—'}`,
    `Канал: ${channel || 'telegram'}`,
  ]
  if (sourceMessage) lines.push(`Исходное сообщение: ${sourceMessage}`)
  return lines.join('\n')
}

function generateMeetingIcs({ uid, title, startsAt, durationMinutes = 30, description = '', location = '', meetingUrl = '', timezone = DEFAULT_TIMEZONE, createdAt = new Date() }) {
  const startDate = startsAt ? new Date(startsAt) : new Date()
  const safeDuration = Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0 ? Number(durationMinutes) : 30
  const endDate = new Date(startDate.getTime() + safeDuration * 60 * 1000)
  const eventLocation = location || meetingUrl || 'AS6 demo-созвон'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AS6 AI CRM//Calendar Integration v1//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${timezone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0300',
    'TZNAME:MSK',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtcDateTime(createdAt)}`,
    `DTSTART;TZID=${timezone}:${formatZonedDateTime(startDate, timezone)}`,
    `DTEND;TZID=${timezone}:${formatZonedDateTime(endDate, timezone)}`,
    `SUMMARY:${escapeIcsText(title || 'Demo-созвон AS6')}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(eventLocation)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

module.exports = {
  DEFAULT_TIMEZONE,
  buildMeetingDescription,
  buildStableIcsUid,
  generateMeetingIcs,
}
