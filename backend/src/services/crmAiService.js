const axios = require('axios')

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'

function extractResponseText(data) {
  if (data?.output_text) return data.output_text.trim()
  const chunks = []
  for (const item of data?.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) chunks.push(content.text)
      if (content.type === 'text' && content.text) chunks.push(content.text)
    }
  }
  return chunks.join('\n').trim()
}

function fallbackFollowUp(lead) {
  const contact = lead.telegram || lead.email || 'удобный канал связи'
  return [
    `Здравствуйте, ${lead.name}!`,
    `Возвращаюсь по вашему запросу${lead.company ? ` для ${lead.company}` : ''}. Предлагаю коротко согласовать следующий шаг по сделке на ${Number(lead.value || 0).toLocaleString('ru-RU')} ₽.`,
    `Можем созвониться на 15 минут и зафиксировать результат, критерии успеха и дату старта? Напишите, пожалуйста, когда удобно ответить в ${contact}.`,
  ].join('\n\n')
}

async function generateCrmFollowUp(lead) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4.1'
  const prompt = {
    role: 'sales_assistant',
    language: 'ru-RU',
    instruction: 'Сгенерируй короткое премиальное follow-up сообщение для B2B CRM лида. Только русский язык. Тон: уверенный, человечный, без давления. Включи контекст, ценность и конкретный следующий шаг.',
    lead: {
      name: lead.name,
      company: lead.company,
      telegram: lead.telegram,
      email: lead.email,
      value: lead.value,
      stage: lead.status,
      notes: lead.notesText || lead.notes?.map((note) => note.body).join('\n'),
    },
  }

  if (!apiKey) {
    return { message: fallbackFollowUp(lead), model: 'fallback-local', prompt }
  }

  const { data } = await axios.post(
    OPENAI_RESPONSES_URL,
    {
      model,
      input: [
        { role: 'system', content: prompt.instruction },
        { role: 'user', content: JSON.stringify(prompt.lead, null, 2) },
      ],
      temperature: 0.55,
      max_output_tokens: 450,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: Number(process.env.OPENAI_TIMEOUT_MS || 60000),
    }
  )

  const message = extractResponseText(data)
  if (!message) throw new Error('OpenAI returned an empty follow-up')
  return { message, model, prompt: { ...prompt, openaiResponseId: data.id } }
}


function fallbackTelegramSalesReply({ lead, incomingMessage }) {
  const name = lead?.name || 'Здравствуйте'
  const context = incomingMessage ? `Спасибо за сообщение: «${incomingMessage}».` : 'Спасибо за обращение.'
  return [
    `${name}, добрый день!`,
    context,
    'Я помогу подобрать решение под вашу задачу. Подскажите, пожалуйста, что для вас важнее сейчас: быстро запустить AI‑воронку, интегрировать CRM или посчитать экономику внедрения?',
  ].join('\n\n')
}

async function generateTelegramSalesReply({ lead, incomingMessage, memory = [] }) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4.1'
  const prompt = {
    role: 'telegram_sales_assistant',
    language: 'ru-RU',
    instruction: 'Ты AI sales assistant SaaS-платформы. Сгенерируй короткий дружелюбный ответ для Telegram: без markdown, без давления, максимум 2-4 предложения. Цель — квалифицировать запрос, показать ценность AI SaaS CRM и предложить следующий понятный шаг. Важно: никогда не обещай, что email, презентация, КП, скриншоты или материалы уже отправлены; подтверждать отправку можно только текстом action executor после успешного SMTP send.',
    lead: {
      name: lead?.name,
      telegram: lead?.telegram,
      source: lead?.source,
      stage: lead?.status,
      notes: lead?.notes,
    },
    incomingMessage,
    memory,
  }

  if (!apiKey) {
    return { message: fallbackTelegramSalesReply({ lead, incomingMessage }), model: 'fallback-local', prompt }
  }

  const { data } = await axios.post(
    OPENAI_RESPONSES_URL,
    {
      model,
      input: [
        { role: 'system', content: `${prompt.instruction} Используй историю последних сообщений как память диалога и не задавай повторно вопросы, на которые клиент уже ответил.` },
        ...memory.map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.content })),
        { role: 'user', content: JSON.stringify({ lead: prompt.lead, incomingMessage }, null, 2) },
      ],
      temperature: 0.55,
      max_output_tokens: 320,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: Number(process.env.OPENAI_TIMEOUT_MS || 60000),
    }
  )

  const message = extractResponseText(data)
  if (!message) throw new Error('OpenAI returned an empty Telegram sales reply')
  return { message, model, prompt: { ...prompt, openaiResponseId: data.id } }
}


module.exports = { generateCrmFollowUp, generateTelegramSalesReply }
