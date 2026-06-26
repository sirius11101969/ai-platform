import { AS6_RECOMMENDATION_TYPES } from './recommendationTypes'

export const AS6_RECOMMENDATIONS = Object.freeze({
  CHECK_PRIORITY_LEADS: {
    id: 'as6_rec_check_priority_leads',
    type: AS6_RECOMMENDATION_TYPES.FIRST_ACTION,
    title: 'Проверить приоритетные лиды CRM',
    summary: 'AS6 рекомендует начать с проверки приоритетных лидов, потому что это самое короткое действие с прямой пользовательской ценностью.',
    actionLabel: 'Открыть CRM',
    href: '/crm?filter=priority',
    evidence: [
      'подтверждено Product Intelligence',
      'основано на Product Evidence',
      'связано с первым действием пользователя',
    ],
  },
})
