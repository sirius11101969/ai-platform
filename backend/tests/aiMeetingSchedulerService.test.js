const assert = require('assert')
const { detectSchedulingIntent } = require('../src/services/aiMeetingSchedulerService')

const detected = detectSchedulingIntent('Да, завтра в 15:00 удобно', {
  now: new Date('2026-05-17T09:00:00.000Z'),
  timeZone: 'Europe/Moscow',
})

assert.ok(detected, 'meeting intent should be detected')
assert.strictEqual(detected.detectedDateText, 'завтра')
assert.strictEqual(detected.detectedTimeText, 'в 15:00')
assert.strictEqual(detected.durationMinutes, 30)
assert.strictEqual(detected.timeZone, 'Europe/Moscow')
assert.ok(detected.confidence >= 90, 'confidence should be high for date + time + convenience phrase')
assert.strictEqual(detected.proposedStartTime, '2026-05-18T12:00:00.000Z')

const afternoon = detectSchedulingIntent('Давайте послезавтра в 3 дня', {
  now: new Date('2026-05-17T09:00:00.000Z'),
  timeZone: 'Europe/Moscow',
})
assert.strictEqual(afternoon.detectedTimeText, 'в 3 дня')
assert.strictEqual(afternoon.proposedStartTime, '2026-05-19T12:00:00.000Z')

assert.strictEqual(detectSchedulingIntent('Спасибо, получил материалы'), null)

console.log('ai meeting scheduler tests passed')
