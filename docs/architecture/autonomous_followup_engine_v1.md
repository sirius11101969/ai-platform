# Autonomous Follow-up Engine v1

## Цель

Autonomous Follow-up Engine v1 добавляет безопасную human-in-the-loop логику для лидов AS6 AI CRM, которые перестали отвечать. Engine не отправляет сообщения автоматически: он только создаёт `followup_sequence_draft` в `ai_worker_queue` со статусом `pending_approval`.

## Worker и action

- Worker: **AI Follow-up Engine** (`ai_followup_worker`).
- Queue action: `followup_sequence_draft`.
- Начальный статус: `pending_approval`.
- Execution доступен только после approval менеджера.

## Trigger conditions

Engine сканирует лидов текущего workspace и создаёт draft, если:

1. У лида есть `telegram_chat_id` или `email`.
2. Последний inbound/outbound touch в Telegram/email/CRM старше порога sequence step.
3. Этап лида не закрыт: `closed_won`, `closed_lost`, `won`, `lost` исключены.
4. В `ai_worker_queue` нет активного/завершённого дубля для той же пары `leadId + sequenceStep` со статусом `pending_approval`, `approved`, `completed` или `executed`.

## Sequence steps

| Step | Threshold | Draft intent |
| --- | ---: | --- |
| `followup_24h` | 24 hours | Мягко вернуться к demo AS6 AI CRM и уточнить актуальность. |
| `followup_3d` | 72 hours | Спросить, актуальна ли задача, и предложить короткий план внедрения. |
| `followup_7d` | 168 hours | Закрыть loop без давления и оставить возможность вернуться позже. |

Engine создаёт максимум один draft на лида за один запуск: первый due step, для которого ещё нет дубля.

## Payload contract

`ai_worker_queue.payload` для `followup_sequence_draft` содержит:

```json
{
  "leadId": "uuid",
  "channel": "telegram|email",
  "sequenceStep": "followup_24h|followup_3d|followup_7d",
  "lastMessageAt": "timestamp",
  "lastMessageText": "string",
  "suggestedText": "string",
  "reason": "string",
  "confidence": 0.82,
  "thresholdHours": 24,
  "inactiveHours": 24.5,
  "noAutoSend": true
}
```

## Approval Center UI

AI Workers → Approval Center shows for follow-up drafts:

- lead name;
- sequence step;
- last message;
- time since last touch;
- AI draft text;
- channel (`telegram` preferred, otherwise `email`);
- approve, edit, send/execute, reject controls.

## Sending behavior

When an approved queue item is executed:

1. If Telegram is available (`telegram_chat_id`), backend sends Telegram via the existing Telegram service.
2. Otherwise backend sends an email via the existing email service.
3. Existing Telegram/email services persist outbound messages.
4. Backend writes timeline/activity event `followup_sent`.
5. Queue item moves to `completed`.

## Dashboard metrics

Dashboard and AI approval metrics expose:

- Follow-ups pending;
- Follow-ups sent today;
- Stale conversations.

## Safety rules

- No auto-send in v1.
- Every draft requires `pending_approval → approved → completed` flow.
- Closed stages are always excluded.
- Duplicate prevention includes pending, approved, completed and executed queue records for the same lead and sequence step.

## Verification checklist

1. Create or receive a Telegram message for a CRM lead.
2. Simulate staleness: update the latest message/lead timestamp to older than 24h.
3. In AI Workers, run **AI Follow-up Engine** with **Запустить**.
4. Confirm a `followup_sequence_draft` appears in Approval Center with `pending_approval`.
5. Approve and send.
6. Confirm outbound Telegram/email record is saved.
7. Confirm timeline/activity contains `followup_sent`.
8. Confirm queue item is `completed` and no duplicate is created for the same sequence step.
