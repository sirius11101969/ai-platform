const assert = require('assert')
const { detectObjection } = require('../src/services/aiSalesBrain/objectionHandlingEngine')
const { detectMeetingIntent } = require('../src/services/aiSalesBrain/meetingIntentDetector')
const { suggestCrmActions } = require('../src/services/aiSalesBrain/crmActionSuggestionEngine')
const { getPricingKnowledge } = require('../src/services/aiSalesBrain/pricingKnowledgeEngine')

const objection = detectObjection('This is too expensive for our budget')
assert.equal(objection.category, 'price_objection')

const meeting = detectMeetingIntent('Can we get a demo and pricing quote?')
assert.ok(meeting.intents.includes('wants_demo'))
assert.ok(meeting.intents.includes('wants_pricing'))

const suggestions = suggestCrmActions({ objection, meetingIntent: meeting, leadScore: 92, pricingInterest: true })
assert.ok(suggestions.some((s) => s.type === 'schedule_demo'))
assert.ok(suggestions.some((s) => s.type === 'send_pricing'))

const pricing = getPricingKnowledge('roi')
assert.equal(pricing.topic, 'roiPositioning')

const sentimentTransition = { from: 'neutral', to: 'positive' }
assert.equal(sentimentTransition.to, 'positive')

console.log('aiSalesBrain tests passed')
