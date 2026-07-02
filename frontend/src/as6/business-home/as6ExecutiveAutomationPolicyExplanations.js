export const executiveAutomationPolicyExplanations = [
  {
    actionId: 'executive.summary.refresh',
    label: 'Обновить executive summary',
    status: 'allowed',
    reason: 'ActionId известен, сценарий только обновляет аналитическое представление и не меняет persistent storage.',
    stepStatus: 'Проверка policy → PASS. Проверка storage drift → PASS. Проверка safe next step → PASS.',
    safeNextStep: 'Разрешить запуск и показать пользователю обновлённую сводку.',
    fallback: 'Если источник данных недоступен, показать последнее безопасное состояние без записи в storage.'
  },
  {
    actionId: 'executive.automation.launchApproved',
    label: 'Запустить утверждённый сценарий',
    status: 'allowed',
    reason: 'Сценарий прошёл governance policy и использует разрешённую цепочку действий.',
    stepStatus: 'Проверка actionId → PASS. Проверка unsafe chain → PASS. Проверка fallback → PASS.',
    safeNextStep: 'Запустить сценарий и показать пользователю результат проверки перед выполнением.',
    fallback: 'Если один из шагов станет небезопасным, остановить цепочку и показать причину блокировки.'
  },
  {
    actionId: 'unknown.actionId',
    label: 'Неизвестное действие',
    status: 'blocked',
    reason: 'ActionId отсутствует в разрешённом governance-каталоге, поэтому AS6 не может гарантировать безопасность выполнения.',
    stepStatus: 'Проверка actionId → FAIL. Проверка safe next step → PASS. Запуск сценария → BLOCKED.',
    safeNextStep: 'Не запускать сценарий. Зарегистрировать actionId в governance и добавить диагностическое покрытие.',
    fallback: 'Показать пользователю объяснение: действие пока не поддерживается, безопасный запуск невозможен.'
  },
  {
    actionId: 'executive.unsafe.chain',
    label: 'Небезопасная цепочка действий',
    status: 'blocked',
    reason: 'Цепочка содержит действие, которое может изменить состояние без достаточного governance-подтверждения.',
    stepStatus: 'Проверка chain safety → FAIL. Проверка fallback → PASS. Запуск сценария → BLOCKED.',
    safeNextStep: 'Остановить сценарий до выполнения и предложить безопасную ручную проверку.',
    fallback: 'Показать пользователю безопасную рекомендацию вместо запуска автоматизации.'
  }
];

export function getExecutiveAutomationPolicyExplanation(actionId) {
  return executiveAutomationPolicyExplanations.find((item) => item.actionId === actionId) || executiveAutomationPolicyExplanations.find((item) => item.actionId === 'unknown.actionId');
}
