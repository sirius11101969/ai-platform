const assert = require('assert')
const { isInternalAiContext, sanitizeAiCopy, sanitizeAiActionPayload } = require('../src/utils/aiCopySanitizer')

const unsafeTexts = [
  'Контекст: Плюсы: +18 demo intent',
  'Плюсы: +8 inbound; Минусы: нет; Итог: 100/100',
  'ai_score: 100 · ai_priority: urgent · ai_risk_level: high',
]

const forbiddenFragments = ['Плюсы', 'Минусы', 'Итог', 'Контекст:', '+18', 'ai_score', 'ai_priority', 'ai_risk_level']

for (const text of unsafeTexts) {
  assert.strictEqual(isInternalAiContext(text), true, `unsafe text should be detected: ${text}`)
  const sanitized = sanitizeAiCopy(text)
  assert.notStrictEqual(sanitized, text.trim(), `unsafe text should be replaced: ${text}`)
  for (const fragment of forbiddenFragments) {
    assert.strictEqual(sanitized.includes(fragment), false, `sanitized text must not contain ${fragment}`)
  }
}

const safeText = 'Здравствуйте! Подтверждаю встречу. Если время нужно изменить — напишите.'
assert.strictEqual(isInternalAiContext(safeText), false, 'safe customer text should not be detected as internal context')
assert.strictEqual(sanitizeAiCopy(safeText), safeText, 'safe customer text should remain unchanged')

const payload = sanitizeAiActionPayload({
  recommendation: 'Плюсы: +8 inbound; Минусы: нет; Итог: 100/100',
  nested: {
    message: safeText,
    scoringReason: 'ai_score: 100 · ai_priority: urgent · ai_risk_level: high',
  },
  list: ['Контекст: Плюсы: +18 demo intent'],
})
const serialized = JSON.stringify(payload)
for (const fragment of forbiddenFragments) {
  assert.strictEqual(serialized.includes(fragment), false, `sanitized payload must not contain ${fragment}`)
}
assert.strictEqual(payload.nested.message, safeText, 'safe nested message should remain unchanged')

console.log('aiCopySanitizer tests passed')
