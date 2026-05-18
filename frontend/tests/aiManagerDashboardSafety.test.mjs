import assert from 'node:assert/strict';
import { groupSafetyEvents } from '../src/utils/aiManagerDashboardSafety.js';

const duplicateCooldowns = Array.from({ length: 7 }, (_, index) => ({
  id: `cooldown-${index}`,
  type: 'ai_followup_skipped_cooldown',
  title: 'AI follow-up пропущен',
  detail: 'Недавнее исходящее сообщение клиенту — cooldown 48 часов.',
  createdAt: `2026-05-18T10:${String(index).padStart(2, '0')}:00.000Z`,
  leadName: ['Дмитрий Волков', 'Telegram Connect Test', 'Алексей Морозов', 'Мария Кузнецова', 'Илья Соколов', 'SberCloud Lab', 'Landing Lead'][index],
}));

const copyGuard = {
  id: 'copy-guard-1',
  type: 'copy_guard_block',
  title: 'Copy guard blocked unsafe draft',
  detail: 'Blocked by copy guard: internal context leak',
  createdAt: '2026-05-18T09:50:00.000Z',
};

const laterCooldown = {
  id: 'cooldown-later',
  type: 'ai_followup_skipped_cooldown',
  title: 'AI follow-up пропущен',
  detail: 'Недавнее исходящее сообщение клиенту — cooldown 48 часов.',
  createdAt: '2026-05-18T11:00:00.000Z',
  leadName: 'Later Lead',
};

const grouped = groupSafetyEvents([...duplicateCooldowns, copyGuard, laterCooldown]);

assert.equal(grouped.length, 3);
assert.equal(grouped[0].title, 'Follow-up cooldown prevented duplicates');
assert.equal(grouped[0].badge, '7 prevented');
assert.equal(grouped[0].preventedCount, 7);
assert.deepEqual(grouped[0].leadNames.slice(0, 3), ['Дмитрий Волков', 'Telegram Connect Test', 'Алексей Морозов']);
assert.equal(grouped[1], copyGuard);
assert.equal(grouped[2], laterCooldown);


const fallbackWithCooldownText = {
  id: 'fallback-1',
  type: 'fallback_to_email',
  title: 'Fallback-to-email event',
  detail: 'Telegram unavailable after cooldown guard check',
  createdAt: '2026-05-18T10:30:00.000Z',
};

const mixedSafety = groupSafetyEvents([duplicateCooldowns[0], duplicateCooldowns[1], fallbackWithCooldownText]);
assert.equal(mixedSafety.length, 2);
assert.equal(mixedSafety[0].badge, '2 prevented');
assert.equal(mixedSafety[1], fallbackWithCooldownText);

const singleCooldown = groupSafetyEvents([laterCooldown]);
assert.equal(singleCooldown[0], laterCooldown);

console.log('aiManagerDashboardSafety grouping tests passed');
