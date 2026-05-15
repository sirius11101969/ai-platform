const WEBSITE_URL = 'https://www.as6.ru'
const CRM_DEMO_URL = 'https://www.as6.ru/crm-demo'

function platformTextIntro(name, companyOrName) {
  return `Здравствуйте, ${name}!\n\nОтправляю материалы по AI‑платформе AS6 для ${companyOrName}. Платформа объединяет Telegram, CRM, email‑коммуникации и AI‑задачи в единый контур продаж.\n\nПреимущества:\n• AI фиксирует запрос клиента и сохраняет контекст в CRM;\n• менеджер видит историю диалога, email и активности в карточке лида;\n• письма уходят реально через SMTP, со статусами, вложениями и retry;\n• follow‑up, КП и материалы можно отправлять без ручного копирования;\n• Docker/PostgreSQL архитектура готова к production запуску.\n\nСайт: ${WEBSITE_URL}\nCRM demo: ${CRM_DEMO_URL}\n\nСледующий шаг: предложите удобное время — покажем CRM demo и соберём сценарий под вашу воронку.`
}

function platformHtml({ name, companyOrName, title = 'Материалы по AI‑платформе AS6' }) {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f4f7fb;font-family:Inter,Arial,sans-serif;color:#14213d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,.12);">
          <tr><td style="background:linear-gradient(135deg,#0f172a,#2563eb);padding:34px 34px 28px;color:#ffffff;">
            <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;opacity:.78;">AS6 AI Platform</div>
            <h1 style="margin:12px 0 0;font-size:30px;line-height:1.15;">${title}</h1>
            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;opacity:.92;">Telegram → CRM → Email → AI‑задачи в одном production‑контуре продаж.</p>
          </td></tr>
          <tr><td style="padding:32px 34px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Здравствуйте, ${name}!</p>
            <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">Отправляю материалы по AI‑платформе AS6 для <strong>${companyOrName}</strong>. Платформа помогает не терять лидов: AI понимает запрос, сохраняет контекст в CRM, отправляет email через SMTP и фиксирует результат в истории сделки.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
              <tr>
                <td style="padding:14px;border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;"><strong>CRM память</strong><br /><span style="color:#475569;">История Telegram, email, заметки и активности в карточке лида.</span></td>
              </tr>
              <tr><td height="10"></td></tr>
              <tr>
                <td style="padding:14px;border:1px solid #dcfce7;border-radius:16px;background:#f0fdf4;"><strong>Реальные действия</strong><br /><span style="color:#475569;">AI подтверждает отправку только после успешного SMTP delivery.</span></td>
              </tr>
              <tr><td height="10"></td></tr>
              <tr>
                <td style="padding:14px;border:1px solid #fde68a;border-radius:16px;background:#fffbeb;"><strong>Production‑контур</strong><br /><span style="color:#475569;">PostgreSQL, очередь, retry, вложения PDF/скриншоты/изображения и Docker.</span></td>
              </tr>
            </table>
            <div style="text-align:center;margin:30px 0;">
              <a href="${CRM_DEMO_URL}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:700;">Открыть CRM demo</a>
              <a href="${WEBSITE_URL}" style="display:inline-block;color:#2563eb;text-decoration:none;border-radius:999px;padding:14px 18px;font-weight:700;">Сайт AS6</a>
            </div>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">Ответьте на это письмо удобным временем — покажем демо и соберём сценарий под вашу воронку.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

const EMAIL_TEMPLATES = {
  materials_pack: {
    id: 'materials_pack',
    title: 'Материалы AI‑платформы',
    subject: 'Материалы по AI‑платформе AS6 для {{companyOrName}}',
    body: platformTextIntro('{{name}}', '{{companyOrName}}'),
  },
  commercial_proposal: {
    id: 'commercial_proposal',
    title: 'Коммерческое предложение',
    subject: 'Коммерческое предложение для {{companyOrName}}',
    body: platformTextIntro('{{name}}', '{{companyOrName}}'),
  },
  demo_invitation: {
    id: 'demo_invitation',
    title: 'Презентация и demo',
    subject: 'Презентация AI‑платформы AS6 для {{companyOrName}}',
    body: platformTextIntro('{{name}}', '{{companyOrName}}'),
  },
  follow_up: {
    id: 'follow_up',
    title: 'Follow‑up',
    subject: 'Следующий шаг по AI‑платформе',
    body: platformTextIntro('{{name}}', '{{companyOrName}}'),
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
    body: platformTextIntro('{{name}}', '{{companyOrName}}'),
  },
}

function renderTemplate(templateId, lead = {}, overrides = {}) {
  const template = EMAIL_TEMPLATES[templateId] || EMAIL_TEMPLATES.materials_pack
  const variables = {
    name: lead.name || 'коллеги',
    companyOrName: lead.company || lead.name || 'вашей компании',
    ...overrides,
  }
  const replaceVars = (text) => String(text || '').replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] || '')
  const subject = replaceVars(overrides.subject || template.subject)
  const text = replaceVars(overrides.text || template.body)
  const html = overrides.html || platformHtml({ name: variables.name, companyOrName: variables.companyOrName, title: subject })
  return { id: template.id, title: template.title, subject, text, html }
}

module.exports = { CRM_DEMO_URL, EMAIL_TEMPLATES, WEBSITE_URL, renderTemplate }
