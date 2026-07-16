import React, { useMemo } from "react";
import "./LivingDocumentsSpace.css";

function formatSize(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function typeOf(mimeType) {
  const value = String(mimeType || "").toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.startsWith("image/")) return "Изображения";
  if (value.includes("sheet") || value.includes("excel")) return "Таблицы";
  if (value.includes("presentation") || value.includes("powerpoint")) return "Презентации";
  if (value.includes("word") || value.includes("text")) return "Документы";
  return "Файлы";
}

function safeOpen(url) {
  if (!url) return;
  try {
    const target = new URL(url, window.location.origin);
    if (target.protocol !== "https:" && target.origin !== window.location.origin) return;
    window.open(target.href, "_blank", "noopener,noreferrer");
  } catch (_error) {
    // Invalid document links remain non-actionable.
  }
}

export default function LivingDocumentsSpace({ livingData }) {
  const documents = livingData.data?.documents || [];
  const documentStatus = livingData.data?.domainStatus?.documents;
  const metrics = useMemo(() => {
    const byType = documents.reduce((result, document) => {
      const type = typeOf(document.mimeType);
      result[type] = (result[type] || 0) + 1;
      return result;
    }, {});
    const totalBytes = documents.reduce((sum, document) => sum + Number(document.sizeBytes || 0), 0);
    return { byType, totalBytes, recent: [...documents].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6) };
  }, [documents]);

  if (livingData.status === "loading") return <div className="as6-docs-state"><strong>Собираем документы пространства…</strong><small>Только чтение. Изменения данных отключены.</small></div>;
  if (!documentStatus?.available) return <div className="as6-docs-state as6-docs-state--error" role="alert"><strong>Не удалось открыть документы.</strong><small>{documentStatus?.error || "Проверьте авторизацию и активное пространство."}</small></div>;

  const nodes = [
    ["Все документы", documents.length],
    ["PDF", metrics.byType.PDF || 0],
    ["Изображения", metrics.byType["Изображения"] || 0],
    ["Таблицы", metrics.byType["Таблицы"] || 0],
    ["Презентации", metrics.byType["Презентации"] || 0],
    ["Другие файлы", (metrics.byType.Файлы || 0) + (metrics.byType.Документы || 0)],
  ];

  return (
    <div className="as6-docs-space" data-as6-documents-mode="real-read-only">
      <header className="as6-docs-intro"><span>Документы · реальные данные</span><h1>Работа с документами</h1><p>AS6 показывает только материалы активного рабочего пространства и не создаёт вымышленные записи.</p></header>
      {!documents.length ? (
        <section className="as6-docs-empty"><strong>В пространстве пока нет документов.</strong><p>Здесь появятся реальные вложения после добавления файлов к работе с клиентами.</p></section>
      ) : (
        <>
          <section className="as6-docs-orbit" aria-label="Карта документов">
            <div className="as6-docs-core"><span>Центр понимания</span><strong>{documents.length}</strong><small>документов · {formatSize(metrics.totalBytes)}</small></div>
            {nodes.map(([label, count], index) => <article key={label} className={`as6-docs-node as6-docs-node--${index + 1}`}><strong>{label}</strong><span>{count}</span></article>)}
          </section>
          <section className="as6-docs-activity"><header><div><span>Что происходит сейчас</span><h2>Последние документы</h2></div><small>активное workspace</small></header><div>{metrics.recent.map((document, index) => <article key={document.id || `${document.fileName}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{document.fileName}</strong><small>{typeOf(document.mimeType)} · {formatSize(document.sizeBytes)} · {formatDate(document.createdAt)}</small></div><button type="button" disabled={!document.downloadUrl} onClick={() => safeOpen(document.downloadUrl)} aria-label={`Открыть ${document.fileName}`}>→</button></article>)}</div></section>
        </>
      )}
      <footer className="as6-docs-footer"><span>Только чтение</span><span>Workspace isolation</span><span>Обновлено: {formatDate(livingData.data?.loadedAt)}</span></footer>
    </div>
  );
}
