const SAFE_MANAGER_SUMMARIES = [
  "Высокий интерес к demo и внедрению.",
  "Сделка требует follow-up сегодня.",
  "Есть риск потери из-за паузы в коммуникации.",
  "Встреча запланирована, нужно подготовить agenda.",
  "Клиент заинтересован в следующем шаге.",
];

const INTERNAL_AI_PATTERNS = [
  /Плюсы\s*:/i,
  /Минусы\s*:/i,
  /Итог\s*:/i,
  /\+\d+/,
  /\bai_score\b\s*:/i,
  /\bai_score\b/i,
  /\bai_priority\b\s*:/i,
  /\bai_priority\b/i,
  /\bai_risk_level\b\s*:/i,
  /\bai_risk_level\b/i,
  /Контекст\s*:/i,
  /\bscoring_reason\b\s*:/i,
  /\bscoring_reason\b/i,
  /priority\s*\/\s*urgent/i,
  /raw\s+[\s\S]{0,40}\b(priority|urgent)\b[\s\S]{0,40}\b(scoring|score|reason|explanation)\b/i,
  /\b(priority|urgent)\b[\s\S]{0,40}\b(scoring|score|reason|explanation)\b/i,
];

const BLOCKED_CUSTOMER_TEXT = "Текст заблокирован copy guard из-за внутреннего AI контекста.";

function normalizeText(text) {
  return String(text ?? "");
}

export function isInternalAiDebugEnabled() {
  return String(import.meta?.env?.VITE_SHOW_INTERNAL_AI_DEBUG || "").toLowerCase() === "true";
}

export function isInternalAiContext(text) {
  const value = normalizeText(text);
  if (!value) return false;
  return INTERNAL_AI_PATTERNS.some((pattern) => pattern.test(value));
}

function pickSafeManagerSummary(text) {
  const value = normalizeText(text).toLowerCase();
  if (/встреч|meeting|agenda|calendar|demo-созвон|booked|заплан/i.test(value)) return SAFE_MANAGER_SUMMARIES[3];
  if (/риск|risk|потер|пауза|no response|нет ответа|молч/i.test(value)) return SAFE_MANAGER_SUMMARIES[2];
  if (/сегодня|follow[- ]?up|дожим|urgent|сроч/i.test(value)) return SAFE_MANAGER_SUMMARIES[1];
  if (/demo|демо|внедрен|intent|интерес|price|цена/i.test(value)) return SAFE_MANAGER_SUMMARIES[0];
  return SAFE_MANAGER_SUMMARIES[4];
}

export function sanitizeVisibleAiText(text) {
  if (text === null || text === undefined) return "";
  const value = normalizeText(text);
  if (!value) return "";
  if (!isInternalAiContext(value)) return value;
  console.warn("[ui-sanitizer] internal AI text sanitized");
  return pickSafeManagerSummary(value);
}

export function sanitizeCustomerVisibleText(text) {
  if (text === null || text === undefined) return "";
  const value = normalizeText(text);
  if (!value) return "";
  if (!isInternalAiContext(value)) return value;
  console.warn("[ui-sanitizer] internal AI text sanitized");
  return BLOCKED_CUSTOMER_TEXT;
}

export { BLOCKED_CUSTOMER_TEXT, SAFE_MANAGER_SUMMARIES };
