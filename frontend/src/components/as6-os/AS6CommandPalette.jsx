import React, { useEffect, useMemo, useState } from "react";
import "../../styles/as6-os-interactive-command-palette.css";

const DEFAULT_COMMANDS = [
  {
    id: "create-lead",
    title: "Создать лид",
    subtitle: "Открыть действие создания нового CRM-лида",
    group: "CRM",
  },
  {
    id: "hot-leads",
    title: "Показать горячие лиды",
    subtitle: "Найти лиды с высоким AI score и вероятностью сделки",
    group: "Revenue",
  },
  {
    id: "risk-deals",
    title: "Показать сделки с риском",
    subtitle: "Проверить at-risk deals и stalled opportunities",
    group: "Revenue",
  },
  {
    id: "revenue-brain",
    title: "Открыть Revenue Brain",
    subtitle: "Перейти к прогнозу, рекомендациям и next best actions",
    group: "AI",
  },
  {
    id: "follow-up",
    title: "Поставить follow-up",
    subtitle: "Подготовить следующий контакт по неактивным клиентам",
    group: "AI",
  },
  {
    id: "ask-as6",
    title: "Спросить AS6",
    subtitle: "Описать задачу простыми словами",
    group: "Assistant",
  },
];

export default function AS6CommandPalette({ page = "/crm", commands = DEFAULT_COMMANDS }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastCommand, setLastCommand] = useState("Готов принять команду");

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) => {
      return [command.title, command.subtitle, command.group]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isOpenShortcut = (event.ctrlKey || event.metaKey) && key === "k";

      if (isOpenShortcut) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((value) => Math.min(value + 1, Math.max(filteredCommands.length - 1, 0)));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((value) => Math.max(value - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          setLastCommand(`${command.title} · подготовлено`);
          setOpen(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredCommands, open, selectedIndex]);

  return (
    <>
      <button
        className="as6-command-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть AS6 Command Palette"
      >
        <span>AS6 Command Layer</span>
        <strong>Спросить AS6</strong>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="as6-command-status" aria-live="polite">
        {lastCommand}
      </div>

      {open ? (
        <div className="as6-command-overlay" role="dialog" aria-modal="true" aria-label="AS6 Command Palette">
          <div className="as6-command-backdrop" onClick={() => setOpen(false)} />
          <section className="as6-command-panel">
            <header>
              <div>
                <span>AS6 Operating System</span>
                <h2>Что сделать сейчас?</h2>
                <p>Страница: {page}. Управляйте CRM через единый командный слой.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть Command Palette">
                Esc
              </button>
            </header>

            <label className="as6-command-search">
              <span>Спросить AS6</span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Например: покажи сделки с риском"
              />
            </label>

            <div className="as6-command-list" role="listbox">
              {filteredCommands.length ? (
                filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    type="button"
                    className={index === selectedIndex ? "active" : ""}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      setLastCommand(`${command.title} · подготовлено`);
                      setOpen(false);
                    }}
                  >
                    <span>{command.group}</span>
                    <strong>{command.title}</strong>
                    <small>{command.subtitle}</small>
                  </button>
                ))
              ) : (
                <div className="as6-command-empty">Команда не найдена. Сформулируйте задачу проще.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
