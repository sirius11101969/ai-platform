const { OpenAiProvider } = require('../providers/openAiProvider')

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



async function executeAiTask(task) {
  const { apiKey, model } = getOpenAiConfig()

  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured')
    error.statusCode = 500
    throw error
  }

  const provider = new OpenAiProvider({ apiKey, model })
  const response = await provider.createResponse({
    input: buildInput(task),
    model,
    temperature: 0.7,
    maxOutputTokens: 900,
    metadata: {
      taskId: task.id,
      userId: task.user_id,
      workspaceId: task.workspace_id,
    },
  })

  return {
    title: TASK_EXECUTION_PROFILES[task.type]?.name || 'AI task result',
    content: response.text,
    generatedAt: new Date().toISOString(),
    startedAt: response.startedAt,
    model: response.model,
    provider: response.provider,
    openaiResponseId: response.id,
    usage: response.usage,
    latencyMs: response.latencyMs,
    creditsSpent: task.credits_spent,
  }
}

module.exports = {
  TASK_EXECUTION_PROFILES,
  executeAiTask,
}
