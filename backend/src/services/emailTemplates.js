const EMAIL_TEMPLATES = {
  commercial_proposal: {
    id: 'commercial_proposal',
    title: 'Коммерческое предложение',
    subject: 'Коммерческое предложение для {{companyOrName}}',
    body: `Здравствуйте, {{name}}!\n\nПодготовили коммерческое предложение по AI‑платформе для {{companyOrName}}.\n\nЧто входит:\n• AI‑воронка продаж и CRM автоматизация;\n• Telegram → CRM → Email сценарии;\n• аналитика, задачи и контроль follow‑up;\n• безопасная интеграция с вашей текущей инфраструктурой.\n\nПредлагаю обсудить детали на коротком созвоне и зафиксировать следующий шаг.`,
  },
  demo_invitation: {
    id: 'demo_invitation',
    title: 'Приглашение на demo',
    subject: 'Demo AI‑платформы для {{companyOrName}}',
    body: `Здравствуйте, {{name}}!\n\nПриглашаю вас на персональную demo‑сессию AI‑платформы. За 20 минут покажем, как система ведёт лидов, отправляет письма, работает с Telegram и помогает менеджеру не терять сделки.\n\nПодскажите, пожалуйста, удобное время на этой неделе?`,
  },
  follow_up: {
    id: 'follow_up',
    title: 'Follow‑up',
    subject: 'Следующий шаг по AI‑платформе',
    body: `Здравствуйте, {{name}}!\n\nВозвращаюсь к нашему диалогу по AI‑платформе. Мы можем быстро собрать сценарий под вашу воронку: захват лида, AI‑квалификация, email с материалами и автоматический follow‑up.\n\nГотовы согласовать следующий шаг?`,
  },
  onboarding: {
    id: 'onboarding',
    title: 'Onboarding',
    subject: 'Старт внедрения AI‑платформы',
    body: `Здравствуйте, {{name}}!\n\nДобро пожаловать в onboarding AI‑платформы. Ниже план запуска:\n1. Подтверждаем цели и KPI.\n2. Подключаем CRM, Telegram и email.\n3. Настраиваем AI‑сценарии и шаблоны.\n4. Запускаем пилот и проверяем результаты.\n\nОтправьте, пожалуйста, контакт технического ответственного и желаемую дату старта.`,
  },
  reactivation: {
    id: 'reactivation',
    title: 'Реактивация',
    subject: 'Вернёмся к AI‑автоматизации продаж?',
    body: `Здравствуйте, {{name}}!\n\nПишу, чтобы аккуратно вернуться к вопросу AI‑автоматизации продаж. Сейчас можем предложить быстрый запуск сценария, где AI сам фиксирует запрос клиента, отправляет нужные материалы и ставит follow‑up менеджеру.\n\nЕсли актуально, предложу 2 варианта внедрения под ваш процесс.`,
  },
}

function renderTemplate(templateId, lead = {}, overrides = {}) {
  const template = EMAIL_TEMPLATES[templateId] || EMAIL_TEMPLATES.follow_up
  const variables = {
    name: lead.name || 'коллеги',
    companyOrName: lead.company || lead.name || 'вашей компании',
    ...overrides,
  }
  const replaceVars = (text) => String(text || '').replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] || '')
  return {
    id: template.id,
    title: template.title,
    subject: replaceVars(overrides.subject || template.subject),
    text: replaceVars(overrides.text || template.body),
    html: overrides.html || `<p>${replaceVars(overrides.text || template.body).replace(/\n/g, '<br />')}</p>`,
  }
}

module.exports = { EMAIL_TEMPLATES, renderTemplate }
