const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const axios = require('axios')

const app = express()

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
})

app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => {
  res.send('OK')
})

app.post('/api/lead', async (req, res) => {
  const { name, contact } = req.body

  await db.query(
    'INSERT INTO leads(name, contact) VALUES($1, $2)',
    [name, contact]
  )

  if (process.env.BITRIX_WEBHOOK) {
    await axios.post(`${process.env.BITRIX_WEBHOOK}/crm.lead.add.json`, {
      fields: {
        TITLE: `Новый лид ${name}`,
        NAME: name,
        PHONE: [{ VALUE: contact, VALUE_TYPE: 'WORK' }]
      }
    })
  }

  res.json({ success: true })
})

app.post('/api/subscribe', async (req, res) => {
  const { userId, plan } = req.body

  const paymentUrl = `https://yookassa.ru/pay/${userId}-${plan}`

  await db.query(
    'INSERT INTO subscriptions(user_id, plan, payment_url) VALUES($1, $2, $3)',
    [userId, plan, paymentUrl]
  )

  res.json({ success: true, paymentUrl })
})

app.listen(3001, () => {
  console.log('Backend started on port 3001')
})
