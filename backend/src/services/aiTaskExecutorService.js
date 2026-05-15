const axios = require('axios')

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'
const DEFAULT_OPENAI_MODEL = 'gpt-4.1'

const TASK_EXECUTION_PROFILES = {
  ai_content_generation: {
    name: 'Генерация текста',
    instructions: [
      'Ты создаёшь готовый маркетинговый или продуктовый текст на русском языке.',
      'Верни структурированный результат с сильным заголовком, основным текстом и коротким CTA.',
      'Пиши конкретно, без воды, с премиальным B2B-тоном.',
    ].join('\n'),
  },
  ai_sales_reply: {
    name: 'Ответ клиенту',
    instructions: [
      'Ты помогаешь менеджеру ответить клиенту на русском языке.',
      'Сохраняй дружелюбный, уверенный и консультативный тон.',
      'Верни готовое сообщение: признание контекста, ценность/ROI, следующий шаг и мягкий CTA.',
    ].join('\n'),
  },
  ai_crm_follow_up: {
    name: 'Follow-up для CRM',
    instructions: [
      'Ты формируешь CRM follow-up на русском языке.',
      'Верни CRM-заметку, следующий шаг, рекомендуемый канал контакта и тайминг следующего касания.',
      'Делай рекомендации практичными для отдела продаж.',
    ].join('\n'),
  },
  ai_telegram_outreach: {
    name: 'Telegram-сообщение',
    instructions: [
      'Ты пишешь короткое Telegram-сообщение на русском языке.',
      'Сообщение должно быть персональным, естественным и без спама.',
      'Верни 1 основной вариант и 2 короткие альтернативы.',
    ].join('\n'),
  },
}

function getOpenAiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
  }
}

function buildInput(task) {
  const profile = TASK_EXECUTION_PROFILES[task.type] || TASK_EXECUTION_PROFILES.ai_content_generation

  return [
    `Тип задачи: ${profile.name}`,
    '',
    'Инструкции:',
    profile.instructions,
    '',
    'Пользовательский контекст:',
    task.prompt,
    '',
    'Формат ответа: готовый результат для вставки в рабочий процесс. Не упоминай, что ты AI.',
  ].join('\n')
}

function extractResponseText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim()
  }

  const textParts = []
  for (const outputItem of response?.output || []) {
    for (const contentItem of outputItem?.content || []) {
      if (typeof contentItem?.text === 'string') {
        textParts.push(contentItem.text)
      }
    }
  }

  return textParts.join('\n').trim()
}

async function executeAiTask(task) {
  const { apiKey, model } = getOpenAiConfig()

  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured')
    error.statusCode = 500
    throw error
  }

  const input = buildInput(task)
  const startedAt = new Date().toISOString()

  const { data } = await axios.post(
    OPENAI_RESPONSES_URL,
    {
      model,
      input,
      temperature: 0.7,
      max_output_tokens: 900,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: Number(process.env.OPENAI_TIMEOUT_MS || 60000),
    }
  )

  const text = extractResponseText(data)
  if (!text) {
    throw new Error('OpenAI returned an empty response')
  }

  return {
    title: TASK_EXECUTION_PROFILES[task.type]?.name || 'AI task result',
    content: text,
    generatedAt: new Date().toISOString(),
    startedAt,
    model,
    provider: 'openai',
    openaiResponseId: data.id,
    creditsSpent: task.credits_spent,
  }
}

module.exports = {
  TASK_EXECUTION_PROFILES,
  executeAiTask,
}
