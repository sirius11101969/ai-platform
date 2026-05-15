# AS6 AI CRM Platform

## Premium SaaS product presentation · 2026

**Позиционирование:** AS6 — AI CRM-платформа для команд продаж, которая объединяет Telegram AI Sales Bot, CRM Pipeline, AI Tasks, AI Credits, Email Actions, AI Follow-up и PostgreSQL-память в едином production-ready контуре на Docker.

---

## 01 · Cover

# AS6 AI CRM Platform

**AI-продажи, CRM-память и автоматические касания в одном SaaS-продукте.**

Платформа превращает входящие обращения из Telegram, сайта и CRM в управляемую воронку: AI ассистент квалифицирует клиента, сохраняет контекст, запускает follow-up, помогает с email и ведёт менеджера к следующему действию.

**Ключевой тезис:** меньше ручной рутины — больше точных касаний, скорости реакции и прогнозируемой выручки.

---

## 02 · Problem

# Продажи теряют скорость из-за разрозненных каналов

Современная команда продаж работает в Telegram, email, CRM, таблицах и личных заметках. Контекст быстро распадается, а менеджеры тратят время не на продажу, а на поиск информации и ручные повторные касания.

**Боли рынка:**

- лиды из Telegram не всегда попадают в CRM;
- история переписки не превращается в структурированную память;
- follow-up зависит от дисциплины менеджера;
- письма и коммерческие предложения готовятся вручную;
- AI используется точечно, а не как системный слой воронки;
- руководитель не видит единый operational cockpit по лидам, AI-задачам и кредитам.

---

## 03 · Solution

# AI CRM как операционная система B2B-продаж

AS6 соединяет CRM, Telegram-бота, AI-генерацию, email-очередь и кредитную модель в единую SaaS-платформу.

**Что делает продукт:**

1. Захватывает лиды из Telegram и формы.
2. Создаёт карточку в CRM Pipeline.
3. Сохраняет сообщения, заметки и follow-up в PostgreSQL.
4. Генерирует персональные ответы, письма и дожимы.
5. Показывает AI Credits, задачи, заказы и активность на Dashboard.
6. Разворачивается в production через Docker Compose: backend, frontend/nginx, PostgreSQL и persistent volumes.

---

## 04 · Product overview

# Единый workspace для роста выручки

**AS6 AI CRM Platform состоит из семи продуктовых слоёв:**

| Слой | Ценность |
| --- | --- |
| Landing page | Премиальная точка входа, CTA в Telegram и лид-форма |
| Dashboard | Сводка по AI Credits, AI Tasks, CRM и заказам |
| CRM Pipeline | Воронка с этапами new → qualified → proposal → booked → won/lost |
| Lead detail | Карточка лида, заметки, история Telegram, email и AI follow-up |
| Telegram AI Sales Bot | Диалоговый AI SDR с памятью последних сообщений |
| Email Actions | AI-генерация письма, вложения, очередь SMTP/Gmail, tracking статусов |
| AI Task Engine | Универсальные задачи: контент, sales reply, CRM follow-up, Telegram outreach |

---

## 05 · Landing page

# Премиальная витрина AI-платформы

Landing page позиционирует продукт как корпоративный AI-стек для продаж: CRM, AI-агенты, Telegram-воронки, платежи и дашборд роста.

**Акценты страницы:**

- hero-блок с обещанием управляемой выручки;
- CTA «Открыть Telegram-бота»;
- блок AI-агентов: AI SDR, AI-поддержка, AI-маркетолог;
- визуальный dashboard preview;
- тарифы «Старт», «Профи», «Бизнес»;
- ROI-метрики: снижение рутины, 24/7 AI-агенты, ускорение обработки лидов.

---

## 06 · Dashboard

# Executive cockpit для AI-продаж

Dashboard показывает руководителю и менеджеру состояние платформы без переключения контекста.

**На одном экране:**

- профиль пользователя, план и компания;
- AI Credits: баланс, расход, дата обновления, прогноз хватит ли кредитов;
- AI Tasks: скоринг, персональный дожим, резюме созвонов;
- быстрые действия: создать AI-задачу, импортировать лиды, открыть CRM, пополнить кредиты;
- заказы и подписки;
- follow-up suggestions и activity feed.

---

## 07 · CRM pipeline

# Воронка, где AI работает рядом с менеджером

CRM Pipeline — это визуальная доска продаж с этапами, стоимостью сделок и AI-контекстом по каждому лиду.

**Сценарий:**

1. Новый лид приходит из Telegram, сайта или импорта.
2. CRM размещает его на этапе воронки.
3. Менеджер видит value, источник, контакты, статус и score.
4. AI подсказывает следующий шаг.
5. Сделка двигается по pipeline до booked/won или фиксируется lost.

**Пример этапов:** новые лиды, квалификация, предложение, демо/бронь, выиграно, потеряно.

---

## 08 · Lead detail and AI memory

# Карточка лида как память сделки

Lead detail объединяет всё, что важно для следующего касания: данные клиента, источники, заметки, переписки, email-историю, AI-дожимы и активность.

**PostgreSQL memory:**

- `crm_leads` хранит контакт, источник, статус, value, Telegram identity и метаданные;
- `telegram_messages` сохраняет историю user/assistant сообщений;
- `crm_followups` хранит сгенерированные AI follow-up, модель и prompt;
- `crm_activity` формирует ленту событий;
- `email_messages` и `email_logs` фиксируют очередь, статусы, открытия и ошибки.

---

## 09 · Telegram AI assistant

# Telegram AI Sales Bot для мгновенной реакции

Telegram AI assistant работает как AI SDR: принимает входящее сообщение, создаёт или обновляет лида, использует историю диалога как память и отвечает в дружелюбном sales-тоне.

**Возможности:**

- захват Telegram-лидов в CRM;
- сохранение username, telegram_id, первого и последнего сообщения;
- генерация ответа с учётом памяти;
- отправка ответа менеджером прямо из CRM;
- manager notification для контроля горячих обращений;
- fallback-сценарии, если AI API недоступен.

---

## 10 · Email actions

# AI-письма, вложения и контролируемая отправка

Email Actions превращают ручную подготовку письма в управляемый workflow.

**Функции:**

- выбор шаблона: commercial proposal, follow-up, onboarding и другие сценарии;
- AI-генерация темы, текста и HTML-версии;
- вложения через storage;
- очередь отправки через SMTP или Gmail API;
- статусы queued, sending, sent, failed;
- tracking token и opened_at для контроля открытия;
- email history внутри карточки лида.

---

## 11 · AI task engine

# Универсальный двигатель AI-операций

AI Task Engine запускает структурированные задачи и списывает AI Credits как продуктовую единицу потребления.

**Поддерживаемые профили:**

- AI content generation — маркетинговые и продуктовые тексты;
- AI sales reply — готовый ответ клиенту;
- AI CRM follow-up — заметка, следующий шаг, канал и тайминг;
- AI Telegram outreach — персональные Telegram-сообщения.

**Бизнес-ценность:** команды получают повторяемый AI-процесс вместо хаотичных промптов в отдельных чатах.

---

## 12 · Architecture

# Production-ready Docker architecture

AS6 построен как практичный monolith-first SaaS-стек.

```text
Browser / Telegram / Email
        │
        ▼
Frontend: React + Vite → nginx
        │
        ▼
Backend: Node.js API
        │        ├── OpenAI Responses API
        │        ├── Telegram Bot API
        │        ├── SMTP / Gmail API
        │        └── JWT Auth + AI Credits
        ▼
PostgreSQL 15
        ├── users, subscriptions, credits_ledger
        ├── ai_tasks
        ├── crm_stages, crm_leads, crm_notes
        ├── telegram_messages, crm_followups, crm_activity
        └── email_messages, email_attachments, email_logs
```

**Deployment:** Docker Compose поднимает backend, db и nginx, хранит PostgreSQL data и email attachments в volumes.

---

## 13 · Roadmap

# Roadmap: от CRM MVP к AI Revenue OS

**Now — текущий продуктовый фундамент**

- Landing, auth, dashboard, CRM pipeline.
- Telegram lead capture и AI sales reply.
- AI follow-up в карточке лида.
- Email composer, attachments, queue и tracking.
- AI Tasks и AI Credits.
- Docker production deployment.

**Next — усиление SaaS-ценности**

- drag-and-drop pipeline;
- role-based team workspace;
- advanced analytics по конверсии и AI ROI;
- интеграции календаря и звонков;
- автоматические sequence/cadence;
- marketplace шаблонов AI-задач;
- enterprise security controls и audit log.

---

## 14 · Pricing direction

# Pricing, построенный вокруг AI Credits и команды

**Направление монетизации:** подписка + AI Credits + внедрение для команд.

| План | Для кого | Наполнение |
| --- | --- | --- |
| Start | малые команды и основатели | 1 AI-агент, Telegram-воронка, базовая CRM, стартовый пакет кредитов |
| Pro | растущие отделы продаж | 3 AI-агента, CRM-автоматизация, email actions, расширенные кредиты |
| Business | команды с управляемой выручкой | командная CRM, дашборды, внедрение, SLA и кастомные сценарии |
| Enterprise | крупные клиенты | security, audit, кастомные интеграции, выделенные лимиты и поддержка |

**Ключ:** клиент платит не за «чат с AI», а за автоматизацию revenue workflow.

---

## 15 · Final CTA

# Запустить AI CRM, которая продаёт быстрее

AS6 AI CRM Platform уже содержит основу премиального AI SaaS-продукта: витрина, рабочий dashboard, CRM pipeline, Telegram AI assistant, email actions, AI task engine, credits ledger, PostgreSQL memory и Docker production deployment.

**Следующий шаг:** провести pilot launch для 1–2 команд продаж, собрать реальные метрики time-to-response, conversion uplift и hours saved, затем упаковать в повторяемый SaaS onboarding.

## AS6 — AI Sales CRM for the next generation of revenue teams.
