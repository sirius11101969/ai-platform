const assert = require('assert')
const express = require('express')

const aiSequenceRoutes = require('../src/routes/aiSequenceRoutes')

async function run() {
  const app = express()
  app.use(express.json())

  const events = []
  const originalInfo = console.info
  console.info = (...args) => events.push(args)

  app.use('/api/ai', aiSequenceRoutes)
  app.get('/api/ai/revenue-engine/snapshot', (req, res) => {
    res.status(200).json({ ok: true, source: 'revenue-engine-controller' })
  })

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })

  try {
    const base = `http://127.0.0.1:${server.address().port}`

    const revenueResponse = await fetch(`${base}/api/ai/revenue-engine/snapshot`)
    const revenueBody = await revenueResponse.json()
    assert.strictEqual(revenueResponse.status, 200)
    assert.strictEqual(revenueBody.source, 'revenue-engine-controller')
    assert.ok(!events.some(([event]) => event === 'sequence_admin_key_accepted'))

    const sequenceResponse = await fetch(`${base}/api/ai/sequences/active`)
    assert.strictEqual(sequenceResponse.status, 401)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    console.info = originalInfo
  }
}

run().then(() => console.log('aiSequenceRouteScoping.test.js passed')).catch((error) => {
  console.error(error)
  process.exit(1)
})
