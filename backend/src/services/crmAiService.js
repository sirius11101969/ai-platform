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
    `Возвращаюсь по вашему запросу${lead.company ? ` для ${lead.company}` : ''}. Можно коротко обсудить, где автоматизация CRM и follow-up снимет ручную нагрузку с команды.`,
    `Удобно созвониться на 15 минут на этой неделе? Если проще — напишите, когда лучше ответить в ${contact}.`,
  ].join('\n\n')
}

async function generateCrmFollowUp(lead) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4.1'
  const prompt = {
    role: 'sales_assistant',
    language: 'ru-RU',
    instruction: 'Сгенерируй короткое B2B follow-up сообщение на русском языке. Тон: человечный, деловой, спокойный, без давления и спама. Используй только структурированный контекст лида: имя, компанию, источник, заметки и бизнес-потребность. Не показывай внутренние поля и формулировки: intent summary, temperature, score, qualification, AI detected, Лид проявил интерес к темам. Превращай теги вроде crm/ai/follow-up в естественный бизнес-смысл. Не обещай интеграции, ROI или результаты, которых нет в контексте. Один понятный CTA.',
    lead: {
      name: lead.name,
      company: lead.company,
      telegram: lead.telegram,
      email: lead.email,
      stage: lead.status,
      source: lead.source,
      businessNeed: lead.businessNeed || lead.intentSummary || '',
      notes: lead.notesText || lead.notes?.map((note) => note.body).join('\n'),
    },
  }

  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is required for CRM AI follow-up')
    error.statusCode = 500
    throw error
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
    instruction: 'Ты sales assistant SaaS-платформы AS6 AI CRM. Сгенерируй естественный ответ для Telegram на русском: 2–5 коротких строк, без markdown, без давления, без спама. Используй имя, источник, контекст сообщения и понятный следующий шаг. Не показывай внутренние слова: intent summary, temperature, score, qualification, AI detected, Лид проявил интерес к темам. Теги crm/ai/follow-up превращай в бизнес-язык: автоматизация CRM, коммуникации, follow-up. Не обещай интеграции, ROI, отправку материалов или срочность, если этого нет в фактах.',
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
    const error = new Error('OPENAI_API_KEY is required for Telegram AI sales reply')
    error.statusCode = 500
    throw error
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


function cleanTelegramDraftText(text) {
  const lines = String(text || '')
    .replace(/[*_`#>]/g, '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)
  return lines.join('\n').trim()
}

function fallbackTelegramReplyDraft(context = {}) {
  const lead = context.lead || {}
  const incoming = String(context.latestInboundMessage || '').toLowerCase()
  const firstName = String(lead.firstName || lead.name || '').trim().split(/\s+/)[0]
  const greeting = firstName && !/^telegram$/i.test(firstName) ? `${firstName}, спасибо за сообщение!` : 'Спасибо за сообщение!'
  const companyLine = lead.company ? `Могу показать, как AS6 AI CRM это закроет для ${lead.company}: лиды, Telegram и follow-up.` : 'Могу показать, как AS6 AI CRM закрывает лиды, Telegram и follow-up под ваш сценарий.'

  if (/демо|demo|посмотреть|показ/i.test(incoming)) {
    return cleanTelegramDraftText(`${greeting}\n${companyLine}\nУдобно созвониться на короткое демо на этой неделе?`)
  }
  if (/цен|стоимост|сколько|тариф|прайс/i.test(incoming)) {
    return cleanTelegramDraftText(`${greeting}\nСтоимость зависит от сценария и объёма коммуникаций, без лишних модулей.\nМогу уточнить пару деталей и предложить подходящий вариант?`)
  }
  if (/интеграц|crm|telegram|телеграм|follow/i.test(incoming)) {
    return cleanTelegramDraftText(`${greeting}\nAS6 AI CRM помогает связать Telegram, CRM и follow-up в один управляемый процесс.\nХотите, я покажу на коротком демо, как это будет выглядеть для вашей воронки?`)
  }
  return cleanTelegramDraftText(`${greeting}\n${companyLine}\nКакой следующий шаг удобнее: короткий созвон или сначала разобрать ваш сценарий в сообщениях?`)
}

async function generateTelegramReplyDraft(context = {}) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4.1'
  const prompt = {
    role: 'telegram_reply_composer',
    language: 'ru-RU',
    instruction: 'Сгенерируй готовый к отправке Telegram-ответ менеджера для AS6 AI CRM. Русский язык. Тон: человечный, короткий, без спама и давления. 2–5 строк, без markdown. Один ясный CTA. Используй только факты из контекста: последнее входящее сообщение, имя лида, компанию, текущий этап, последний AI score, предыдущую timeline и recommended_next_step. Не раскрывай score, внутренние статусы и служебные поля клиенту.',
    context,
  }

  if (!apiKey) {
    return { message: fallbackTelegramReplyDraft(context), model: 'deterministic-telegram-reply-composer', prompt: { ...prompt, fallback: true } }
  }

  try {
    const { data } = await axios.post(
      OPENAI_RESPONSES_URL,
      {
        model,
        input: [
          { role: 'system', content: prompt.instruction },
          { role: 'user', content: JSON.stringify(context, null, 2) },
        ],
        temperature: 0.45,
        max_output_tokens: 260,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: Number(process.env.OPENAI_TIMEOUT_MS || 60000),
      }
    )
    const message = cleanTelegramDraftText(extractResponseText(data))
    if (!message) throw new Error('OpenAI returned an empty Telegram reply draft')
    return { message, model, prompt: { ...prompt, openaiResponseId: data.id } }
  } catch (error) {
    return { message: fallbackTelegramReplyDraft(context), model: 'deterministic-telegram-reply-composer', prompt: { ...prompt, fallback: true, error: error.message } }
  }
}


module.exports = { generateCrmFollowUp, generateTelegramSalesReply, generateTelegramReplyDraft }
