const axios = require('axios')

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = 'gpt-4.1'

const ACTION_PROMPTS = {
  analyze_lead: 'Проанализируй CRM лида, историю Telegram, заметки и email. Верни JSON с полями recommendations (массив строк), nextBestAction, urgencyScore (0-100), conversionProbability (0-100), followUpRecommendation, reasoning, draftMessage.',
  generate_follow_up: 'Сгенерируй персональный follow-up по реальному контексту лида. Верни JSON с полями message, channel, sendAfterHours, reasoning.',
  generate_commercial_offer: 'Сгенерируй короткое коммерческое предложение по реальному контексту лида. Верни JSON с полями subject, offer, valueBullets, nextStep.',
  generate_telegram_response: 'Сгенерируй готовый ответ в Telegram по истории диалога. Верни JSON с полями message, reasoning, nextStep.',
  generate_email_response: 'Сгенерируй готовый email ответ по истории общения. Верни JSON с полями subject, text, reasoning, nextStep.',
}

function extractResponseText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim()
  const chunks = []
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') chunks.push(content.text)
    }
  }
  return chunks.join('\n').trim()
}

function parseJsonResult(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch (_error) {
    return { content: text }
  }
}

function requireOpenAiKey() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is required for AI agent actions')
    error.statusCode = 500
    throw error
  }
  return apiKey
}

function buildAgentInput({ taskType, context }) {
  return [
    'Ты AI Sales Agent для AS6 AI CRM. Работай только на русском языке.',
    'Не выдумывай факты. Используй только переданный CRM, Telegram, notes и email контекст. Если данных недостаточно — явно укажи это в reasoning и предложи безопасный следующий шаг.',
    'Не отправляй сообщения и не утверждай, что сообщение отправлено. Можно только подготовить черновик или рекомендацию.',
    ACTION_PROMPTS[taskType] || ACTION_PROMPTS.analyze_lead,
    'Ответ должен быть валидным JSON без markdown.',
    '',
    'Реальный контекст лида:',
    JSON.stringify(context, null, 2),
  ].join('\n')
}

async function runSalesAgent({ taskType, context }) {
  const apiKey = requireOpenAiKey()
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL
  const startedAt = new Date().toISOString()
  const input = buildAgentInput({ taskType, context })

  const { data } = await axios.post(
    OPENAI_RESPONSES_URL,
    {
      model,
      input,
      temperature: 0.35,
      max_output_tokens: 1100,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: Number(process.env.OPENAI_TIMEOUT_MS || 60000),
    }
  )

  const text = extractResponseText(data)
  if (!text) throw new Error('OpenAI returned an empty AI agent response')
  return {
    ...parseJsonResult(text),
    rawText: text,
    provider: 'openai',
    model,
    openaiResponseId: data.id,
    startedAt,
    generatedAt: new Date().toISOString(),
  }
}

module.exports = { ACTION_PROMPTS, runSalesAgent }
