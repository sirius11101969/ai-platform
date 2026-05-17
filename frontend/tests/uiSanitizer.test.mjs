import assert from "node:assert/strict";
import { isInternalAiContext, sanitizeCustomerVisibleText, sanitizeVisibleAiText } from "../src/utils/uiSanitizer.js";

const forbidden = [/Плюсы:/i, /Минусы:/i, /Итог:/i, /\+18\b/, /Контекст:\s*Плюсы/i, /ai_score:/i, /ai_priority:/i, /ai_risk_level:/i];
const inputs = [
  "Плюсы: +18 цена; Минусы: нет; Итог: 79/100",
  "Контекст: Плюсы: +18 demo intent",
  "ai_score: 100 · ai_priority: urgent",
];

for (const input of inputs) {
  assert.equal(isInternalAiContext(input), true, `${input} should be internal AI context`);
  const sanitized = sanitizeVisibleAiText(input);
  assert.ok(sanitized, "sanitized text should not be empty");
  for (const pattern of forbidden) {
    assert.equal(pattern.test(sanitized), false, `${sanitized} should not match ${pattern}`);
  }
}

assert.equal(isInternalAiContext("Клиент заинтересован в следующем шаге."), false);
assert.equal(sanitizeVisibleAiText("Клиент заинтересован в следующем шаге."), "Клиент заинтересован в следующем шаге.");
assert.equal(sanitizeCustomerVisibleText("Контекст: Плюсы: +18 demo intent"), "Текст заблокирован copy guard из-за внутреннего AI контекста.");

console.log("ui sanitizer tests passed");
