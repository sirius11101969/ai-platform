import React from 'react';

export default function AS6FirstDawnPanel() {
  return (
    <section
      aria-label="AS6 First Dawn"
      style={{
        margin: '0 0 20px',
        padding: '18px',
        borderRadius: '18px',
        border: '1px solid rgba(148, 163, 184, 0.22)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.88))',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.18)',
        color: '#f8fafc',
      }}
    >
      <div style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: '8px' }}>
        AS6 · Первый Рассвет
      </div>
      <h2 style={{ margin: '0 0 8px', fontSize: '24px', lineHeight: 1.2 }}>
        Сегодня AS6 помогает понять ситуацию и выбрать следующий шаг.
      </h2>
      <p style={{ margin: 0, maxWidth: '760px', color: '#dbeafe', fontSize: '15px', lineHeight: 1.6 }}>
        Ваш бизнес — простыми словами: что происходит, что важно сейчас и какое решение поможет двигаться вперёд увереннее.
      </p>
    </section>
  );
}
