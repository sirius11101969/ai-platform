import { useState } from 'react'

export default function App() {
  const [referrals, setReferrals] = useState(10)
  const [avgCheck, setAvgCheck] = useState(3900)

  const income = referrals * avgCheck * 0.5

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>AI Bot Platform</h1>

      <a
        href="https://t.me/Content_ChatGPT_5_Bot"
        target="_blank"
        rel="noreferrer"
      >
        Открыть Telegram Бота
      </a>

      <h2>Калькулятор дохода</h2>

      <input
        type="number"
        value={referrals}
        onChange={(e) => setReferrals(Number(e.target.value))}
      />

      <input
        type="number"
        value={avgCheck}
        onChange={(e) => setAvgCheck(Number(e.target.value))}
      />

      <p>Доход: {income.toLocaleString()} ₽ / мес</p>
    </div>
  )
}
