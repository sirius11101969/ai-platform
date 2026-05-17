# AI Workers Focus Queue v2

## Purpose

AI Workers Focus Queue v2 makes the Approval Center production-friendly for a sales manager. The default view no longer exposes every historical, legacy, or safety-test queue row as urgent work. Instead, it presents a short high-signal queue and moves noisy records into collapsed audit/history sections.

Primary UI copy:

- Title: **Focus Queue**
- Description: **Показываем только задачи, которые реально требуют действия менеджера сейчас.**

## Default Focus behavior

The default tab is **Focus** and it renders at most 10 active actionable tasks. The queue is deterministic: actions are sorted by focus priority and then by creation time descending.

Priority order:

1. Pending/approved customer-facing actions created in the last 72 hours.
2. `next_best_action_engine` actions.
3. `pipeline_copilot` actions.
4. Email/Telegram follow-up drafts.
5. Meeting proposals and meeting confirmations.
6. Unresolved failed customer-facing actions.

## Hidden from default Focus

The default Focus queue hides these classes of records:

- Completed, executed, rejected, or cancelled actions.
- Failed safety tests and Unsafe Copy Guard test records.
- Old failed actions that have a newer completed customer-facing fallback for the same lead.
- Completed `lead_scoring_update` actions.
- Stale legacy `telegram_draft` / `email_draft` records older than 72 hours.
- Generic low/medium-value `lead_priority_recommendation` records.
- Any actionable records beyond the top-10 cap; they remain accessible in legacy/all sections.

## Metrics

The Approval Center replaces the noisy historical waiting count with production-oriented metrics:

- **Actionable now** — count shown in the Focus queue.
- **Needs approval** — pending/approved non-safety actions.
- **Failed unresolved** — failed actions without newer completed fallback.
- **Hidden legacy** — records intentionally outside the Focus queue.
- **Completed history** — completed/executed/rejected/cancelled audit rows.
- **Safety history** — copy-guard and safety-test rows.

## Tabs

The Approval Center supports these tabs:

- **Focus** — default high-signal queue, capped at 10.
- **Needs Approval** — active pending/approved items.
- **Failed** — unresolved failures.
- **Meetings** — active meeting proposals/confirmations.
- **Follow-ups** — active email/Telegram follow-up drafts.
- **All** — complete queue payload.

## Collapsed sections

The following sections are collapsed by default and stay available for audit/debugging:

- **Show legacy pending**
- **Show completed history**
- **Show safety history**
- **Show all actions**

## Route highlight behavior

Route highlighting remains supported for `/ai-workers?actionId=<id>` and lead deep links. If the target action is hidden from the selected tab, the UI automatically opens the relevant collapsed section and scrolls/highlights the row.

The UI logs:

- `[ai-workers-focus] focus queue built`
- `[ai-workers-focus] legacy actions hidden`
- `[ai-workers-focus] route highlight expanded hidden section`

## Safety guarantees

Focus Queue v2 does not remove any sanitizer or copy-guard layer:

- Frontend `sanitizeVisibleAiText` remains used when rendering AI text.
- Frontend customer-visible draft rendering continues to use sanitizer helpers.
- Backend `aiCopySanitizer` and AI copy sanitizer middleware remain unchanged.
- Backend customer copy guard remains unchanged.

## Verification checklist

After deployment:

- `/ai-workers` should show around 5–10 Focus items when enough recent actionable work exists.
- The scary “171 ждут” style main indicator should not be the primary Approval Center number.
- Pipeline Copilot follow-up drafts should remain visible in Focus/Follow-ups when active.
- Recent NBA/email/meeting items should remain visible.
- Unsafe Copy Guard test rows should not appear in Focus.
- Old failed Telegram issues should not be urgent when a newer email fallback completed for the same lead.
- `/ai-workers?actionId=89b2651a-3a7b-49ab-81ed-f22c3f6df03a` should still expand, scroll, and highlight the action when present in the payload.
- Existing DB leakage verification should still return 0 rows.
