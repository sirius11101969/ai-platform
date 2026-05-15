const pool = require('../db/pool')
const { analyzeLeadIntelligence, findLead } = require('./crmModel')

const DEMO_SEED_KEY = 'as6-demo-sales-pipeline-v1'

const demoLeads = [
  {
    key: 'hot-demo-price',
    name: 'Алексей Морозов',
    company: 'NordTech Retail',
    email: 'alexey.morozov.demo@as6.ai',
    telegram: '@alex_morozov_demo',
    telegramUsername: 'alex_morozov_demo',
    value: 480000,
    status: 'proposal',
    source: 'Telegram',
    notes: [
      'Горячий лид: хочет демо AS6 AI CRM и просит цену на команду продаж из 8 менеджеров.',
      'Нужно сегодня отправить пакет Business, показать прогноз ROI и предложить слот на демо.'
    ],
    activities: [
      ['lead_created', 'Демо-лид создан', 'Запросил демо и стоимость внедрения AI CRM.'],
      ['deal_intent_detected', 'Выявлен высокий интент', 'Клиент спрашивает цену, сроки запуска и интеграцию с Telegram.']
    ],
    timeline: [
      ['telegram_message', 'Входящее сообщение Telegram', 'Хочу увидеть демо и понять цену для отдела продаж.'],
      ['crm_note', 'Заметка менеджера', 'Приоритет: связаться в течение 2 часов.']
    ],
    telegramMessages: [
      ['user', 'Здравствуйте! Хотим демо AI CRM. Сколько стоит подключение для команды продаж?'],
      ['assistant', 'Здравствуйте, Алексей! Подготовлю демо под ваш сценарий и покажу тарифы для команды. Удобно сегодня в 16:00?'],
      ['user', 'Да, сегодня удобно. Ещё важно понять, как AI будет вести follow-up в Telegram.']
    ],
  },
  {
    key: 'warm-telegram-ai',
    name: 'Мария Кузнецова',
    company: 'UrbanFit Studio',
    email: 'maria.kuznetsova.demo@as6.ai',
    telegram: '@maria_urbanfit_demo',
    telegramUsername: 'maria_urbanfit_demo',
    value: 220000,
    status: 'qualified',
    source: 'Telegram',
    notes: [
      'Тёплый лид: интересуется Telegram AI для обработки входящих заявок и записи клиентов.',
      'Попросила примеры сценариев и безопасность ручного одобрения сообщений.'
    ],
    activities: [
      ['lead_qualified', 'Лид квалифицирован', 'Есть потребность в Telegram AI ассистенте и CRM pipeline.'],
      ['next_step_planned', 'Запланирован следующий шаг', 'Отправить короткий сценарий автоматизации и предложить 20-минутный созвон.']
    ],
    timeline: [
      ['telegram_message', 'Вопрос про Telegram AI', 'Интересуется автоответами, записью и передачей горячих лидов менеджеру.']
    ],
    telegramMessages: [
      ['user', 'Подскажите, Telegram AI сможет отвечать клиентам студии и передавать заявки менеджеру?'],
      ['assistant', 'Да, AI может предложить ответ, сохранить лид в CRM и поставить follow-up на одобрение менеджеру.'],
      ['user', 'Звучит интересно, пришлите пример сценария для фитнес-студии.']
    ],
  },
  {
    key: 'cold-what-can-you-do',
    name: 'Игорь Павлов',
    company: 'Solo Founder Lab',
    email: 'igor.pavlov.demo@as6.ai',
    telegram: '@igor_founder_demo',
    telegramUsername: 'igor_founder_demo',
    value: 90000,
    status: 'new',
    source: 'Сайт',
    notes: [
      'Холодный лид: просто спросил «что умеете?» без явного бюджета и сроков.',
      'Нужен образовательный follow-up: показать 3 понятных сценария для малого бизнеса.'
    ],
    activities: [
      ['lead_created', 'Холодный лид создан', 'Пока нет подтверждённой боли, бюджета и дедлайна.']
    ],
    timeline: [
      ['website_chat', 'Вопрос с сайта', 'Клиент спросил, какие задачи закрывает платформа.']
    ],
    telegramMessages: [
      ['user', 'Привет. А что вообще умеете?'],
      ['assistant', 'AS6 помогает вести CRM, анализировать лидов AI scoring и готовить follow-up для Telegram и email.']
    ],
  },
  {
    key: 'email-presentation-request',
    name: 'Елена Смирнова',
    company: 'B2B Logistics Group',
    email: 'elena.smirnova.demo@as6.ai',
    telegram: '',
    telegramUsername: '',
    value: 350000,
    status: 'qualified',
    source: 'Email',
    notes: [
      'Лид из email: попросила презентацию для директора по продажам.',
      'Важно отправить материалы, затем через день уточнить вопросы и предложить демо.'
    ],
    activities: [
      ['email_received', 'Получен запрос по email', 'Попросили презентацию AS6 AI CRM Platform.'],
      ['presentation_sent', 'Презентация отправлена', 'Отправлен обзор платформы и сценарии AI Workers.']
    ],
    timeline: [
      ['email_received', 'Входящее письмо', 'Просьба прислать презентацию и описание тарифов.'],
      ['email_sent', 'Исходящее письмо', 'Отправлена презентация и предложение демо.']
    ],
    emails: [
      {
        subject: 'Презентация AS6 AI CRM Platform',
        text: 'Елена, добрый день! Направляю презентацию AS6 AI CRM Platform и предлагаю короткое демо под ваш pipeline.',
        opened: true,
      }
    ],
  },
  {
    key: 'meeting-request',
    name: 'Дмитрий Волков',
    company: 'FinExpert Consulting',
    email: 'dmitry.volkov.demo@as6.ai',
    telegram: '@dvolkov_demo',
    telegramUsername: 'dvolkov_demo',
    value: 610000,
    status: 'booked',
    source: 'Рекомендация',
    notes: [
      'Лид на встречу: хочет созвон с демонстрацией CRM, AI scoring и очереди одобрения действий.',
      'Созвон назначен, нужно подготовить сценарий для консалтинговой компании.'
    ],
    activities: [
      ['meeting_booked', 'Созвон назначен', 'Клиент хочет обсудить внедрение и безопасность AI действий.'],
      ['demo_scope_defined', 'Сценарий демо согласован', 'Фокус: pipeline, AI scoring, Telegram и email follow-up.']
    ],
    timeline: [
      ['meeting_booked', 'Встреча в календаре', 'Демо-звонок назначен на ближайший рабочий день.'],
      ['crm_note', 'Подготовка к встрече', 'Показать контроль одобрения AI действий менеджером.']
    ],
    telegramMessages: [
      ['user', 'Коллеги рекомендовали вашу платформу. Давайте созвонимся и посмотрим CRM + AI scoring.'],
      ['assistant', 'Дмитрий, отлично. Забронировал слот и подготовлю демо под консалтинг и длинные сделки.']
    ],
    emails: [
      {
        subject: 'Подтверждение демо AS6 AI CRM',
        text: 'Дмитрий, подтверждаю демо-встречу. Покажем CRM pipeline, AI Workers и безопасное одобрение действий.',
        opened: false,
      }
    ],
  },
]

function minutesAgo(index, offset = 0) {
  return new Date(Date.now() - (index * 38 + offset) * 60 * 1000).toISOString()
}

async function insertActivity(client, userId, workspaceId, leadId, type, title, body, metadata = {}) {
  await client.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [userId, workspaceId, leadId, type, title, body, metadata]
  )
}

async function insertTimelineEvent(client, userId, workspaceId, leadId, eventType, title, body, source, metadata = {}) {
  await client.query(
    `INSERT INTO lead_timeline_events(workspace_id, lead_id, user_id, event_type, title, body, source, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
    [workspaceId, leadId, userId, eventType, title, body, source, metadata]
  )
}

async function seedDemoSalesPipeline(userId, workspaceId) {
  const client = await pool.connect()
  const createdLeadIds = []

  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${DEMO_SEED_KEY}:${workspaceId}:${userId}`])

    const existing = await client.query(
      `SELECT id FROM crm_leads
        WHERE user_id = $1 AND workspace_id = $2 AND metadata->>'demoSeedKey' = $3
        LIMIT 1`,
      [userId, workspaceId, DEMO_SEED_KEY]
    )

    if (existing.rows[0]) {
      await client.query('COMMIT')
      return { alreadyExists: true, created: 0, leads: [] }
    }

    for (const [index, demoLead] of demoLeads.entries()) {
      const notesText = demoLead.notes.join('\n')
      const result = await client.query(
        `INSERT INTO crm_leads(user_id, workspace_id, name, email, phone, telegram, telegram_username, company, status, stage, value, source, notes, contact, first_message, last_message_at, last_seen_at, metadata)
         VALUES($1, $2, $3, $4, NULL, $5, $6, $7, $8, $8, $9, $10, $11, COALESCE(NULLIF($5, ''), $4), $12, NOW() - ($13::int * INTERVAL '1 minute'), NOW() - ($14::int * INTERVAL '1 minute'), $15)
         RETURNING id`,
        [
          userId,
          workspaceId,
          demoLead.name,
          demoLead.email,
          demoLead.telegram || null,
          demoLead.telegramUsername || null,
          demoLead.company,
          demoLead.status,
          demoLead.value,
          demoLead.source,
          notesText,
          demoLead.telegramMessages?.[0]?.[1] || demoLead.notes[0],
          index * 40 + 12,
          index * 35 + 4,
          { demoSeedKey: DEMO_SEED_KEY, demoLeadKey: demoLead.key, safeDemoData: true },
        ]
      )
      const leadId = result.rows[0].id
      createdLeadIds.push(leadId)

      for (const [noteIndex, note] of demoLead.notes.entries()) {
        await client.query(
          `INSERT INTO crm_notes(lead_id, user_id, workspace_id, body, created_at)
           VALUES($1, $2, $3, $4, $5)`,
          [leadId, userId, workspaceId, note, minutesAgo(index + 1, noteIndex * 4)]
        )
      }

      for (const [activityIndex, activity] of demoLead.activities.entries()) {
        await insertActivity(client, userId, workspaceId, leadId, activity[0], activity[1], activity[2], { demoSeedKey: DEMO_SEED_KEY, demoLeadKey: demoLead.key, order: activityIndex })
      }

      for (const [timelineIndex, event] of demoLead.timeline.entries()) {
        await insertTimelineEvent(client, userId, workspaceId, leadId, event[0], event[1], event[2], event[0].startsWith('email') ? 'email' : event[0].startsWith('telegram') ? 'telegram' : 'crm', { demoSeedKey: DEMO_SEED_KEY, demoLeadKey: demoLead.key, order: timelineIndex })
      }

      for (const [messageIndex, message] of (demoLead.telegramMessages || []).entries()) {
        await client.query(
          `INSERT INTO telegram_messages(lead_id, user_id, workspace_id, role, message, telegram_message_id, created_at)
           VALUES($1, $2, $3, $4, $5, $6, $7)`,
          [leadId, userId, workspaceId, message[0], message[1], `demo-${demoLead.key}-${messageIndex + 1}`, minutesAgo(index + 1, messageIndex * 8)]
        )
      }

      for (const [emailIndex, email] of (demoLead.emails || []).entries()) {
        const emailResult = await client.query(
          `INSERT INTO email_messages(user_id, workspace_id, lead_id, to_email, from_email, subject, text_body, html_body, template, status, provider, tracking_token, scheduled_at, sent_at, opened_at, metadata)
           VALUES($1, $2, $3, $4, 'demo@as6.ai', $5, $6, $7, 'demo_sales_pipeline', 'sent', 'demo', gen_random_uuid()::text, NOW() - ($8::int * INTERVAL '1 minute'), NOW() - ($9::int * INTERVAL '1 minute'), CASE WHEN $10 THEN NOW() - ($11::int * INTERVAL '1 minute') ELSE NULL END, $12)
           RETURNING id`,
          [userId, workspaceId, leadId, demoLead.email, email.subject, email.text, `<p>${email.text}</p>`, index * 45 + emailIndex * 5 + 5, index * 45 + emailIndex * 5 + 4, email.opened, index * 45 + emailIndex * 5 + 2, { demoSeedKey: DEMO_SEED_KEY, demoLeadKey: demoLead.key }]
        )
        await client.query(
          `INSERT INTO email_logs(user_id, workspace_id, email_id, recipient, subject, status, lead_id, metadata)
           VALUES($1, $2, $3, $4, $5, 'sent', $6, $7)`,
          [userId, workspaceId, emailResult.rows[0].id, demoLead.email, email.subject, leadId, { demoSeedKey: DEMO_SEED_KEY, demoLeadKey: demoLead.key }]
        )
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const analyzed = []
  for (const leadId of createdLeadIds) {
    analyzed.push(await analyzeLeadIntelligence(userId, workspaceId, leadId).catch((error) => ({ leadId, error: error.message })))
  }

  const leads = []
  for (const leadId of createdLeadIds) {
    const lead = await findLead(userId, workspaceId, leadId).catch(() => null)
    if (lead) leads.push(lead)
  }

  return { alreadyExists: false, created: leads.length, leads, analyzed }
}

module.exports = { DEMO_SEED_KEY, seedDemoSalesPipeline }
