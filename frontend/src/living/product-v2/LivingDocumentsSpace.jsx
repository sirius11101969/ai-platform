import React, { useMemo } from "react";
import LivingSpaceEngine from "./LivingSpaceEngine.jsx";

function typeOf(mimeType) {
  const value = String(mimeType || "").toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.startsWith("image/")) return "Изображения";
  if (value.includes("sheet") || value.includes("excel")) return "Таблицы";
  if (value.includes("presentation") || value.includes("powerpoint")) return "Презентации";
  if (value.includes("word") || value.includes("text")) return "Документы";
  return "Другие файлы";
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function LivingDocumentsSpace({ livingData, navigate }) {
  const documents = livingData.data?.documents || [];
  const status = livingData.data?.domainStatus?.documents;
  const definition = useMemo(() => {
    const byType = documents.reduce((result, document) => { const type = typeOf(document.mimeType); result[type] = (result[type] || 0) + 1; return result; }, {});
    const recent = [...documents].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 7);
    const nodes = ["PDF", "Изображения", "Таблицы", "Презентации", "Документы", "Другие файлы"].map((label) => ({ label, value: String(byType[label] || 0), note: "реальных файлов" }));
    const events = recent.map((document) => ({ time: formatDate(document.createdAt), text: `${document.fileName} · ${typeOf(document.mimeType)}` }));
    return {
      id: "documents", label: "Документы", spaceTitle: "Пространство знаний", symbol: "▤", center: "Работа с документами", coreLabel: "Центр понимания",
      subtitle: "AS6 связывает содержание документов с рабочим контекстом.",
      coreText: documents.length ? `Связано ${documents.length} реальных материалов активного пространства.` : "Пространство готово принять первый реальный документ.",
      greeting: "Доброе утро, Владимир.", context: "Документы становятся знаниями. AS6 показывает только подтверждённые материалы активного пространства.",
      confidence: documents.length ? Math.min(96, 70 + documents.length * 2) : 70, confidenceNote: "Метрики вычисляются только из реальных workspace-данных.",
      nodes, events, emptyActivity: "Новых документов пока нет.",
      insights: [{ value: documents.length, label: "документов" }, { value: recent.length, label: "недавних событий" }, { value: Object.keys(byType).length, label: "типов материалов" }],
      recommendation: documents.length ? "Проверьте последние документы и связи с клиентами." : "Добавьте первый документ к работе с клиентом.",
      recommendationText: documents.length ? "AS6 готов превратить материалы в подтверждённый рабочий контекст." : "После появления реального файла пространство автоматически построит связи и события.",
      actionLabel: "Открыть AI-анализ", intentLabel: "Что вы хотите узнать из документов?", pathTitle: "Путь работы с документами"
    };
  }, [documents]);

  if (livingData.status === "loading") return <div className="as6-v2-data-state" role="status"><strong>Собираем документы пространства…</strong><small>Только чтение. Изменения данных отключены.</small></div>;
  if (!status?.available) return <div className="as6-v2-data-state as6-v2-data-state--error" role="alert"><strong>Не удалось открыть документы.</strong><small>{status?.error || "Проверьте авторизацию и активное пространство."}</small></div>;
  return <LivingSpaceEngine definition={definition} navigate={navigate} />;
}
