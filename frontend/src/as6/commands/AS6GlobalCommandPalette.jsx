import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAS6LivingSpaceMenuItems } from "../living-spaces/as6LivingSpaceEngine";
import "./AS6GlobalCommandPalette.css";

const STATIC_COMMANDS = [
  { id: "dashboard", label: "Open Dashboard", route: "/dashboard", group: "Pages" },
  { id: "command-center", label: "Open Command Center", route: "/command-center", group: "Pages" },
  { id: "ai-workers", label: "Open AI Workers", route: "/ai-workers", group: "AI" },
  { id: "pipeline-copilot", label: "Open Pipeline Copilot", route: "/pipeline-copilot", group: "AI" },
  { id: "revenue-dashboard", label: "Open Revenue Dashboard", route: "/dashboard/revenue", group: "Revenue" },
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

export function AS6GlobalCommandPalette() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const commands = useMemo(() => {
    const livingSpaceCommands = getAS6LivingSpaceMenuItems().map((item) => ({
      id: `living-space:${item.id}`,
      label: `Open ${item.label}`,
      route: item.route,
      group: "Living Spaces",
    }));

    return [...livingSpaceCommands, ...STATIC_COMMANDS];
  }, []);

  const filteredCommands = useMemo(() => {
    const needle = normalize(query);

    if (!needle) {
      return commands;
    }

    return commands.filter((command) =>
      normalize(`${command.label} ${command.route} ${command.group}`).includes(needle),
    );
  }, [commands, query]);

  useEffect(() => {
    function handleKeyDown(event) {
      const isCommandK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (!isCommandK) {
        return;
      }

      event.preventDefault();
      setIsOpen((current) => !current);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function runCommand(command) {
    navigate(command.route);
    setIsOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        className="as6-command-palette-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open AS6 command palette"
      >
        <span>Search commands</span>
        <kbd>Ctrl K</kbd>
      </button>

      {isOpen ? (
        <div className="as6-command-palette" role="dialog" aria-modal="true" aria-label="AS6 command palette">
          <button
            type="button"
            className="as6-command-palette__backdrop"
            aria-label="Close command palette"
            onClick={() => setIsOpen(false)}
          />

          <div className="as6-command-palette__panel">
            <div className="as6-command-palette__header">
              <span>AS6 Command Palette</span>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close command palette">
                Esc
              </button>
            </div>

            <input
              autoFocus
              className="as6-command-palette__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Living Spaces, pages and AI tools..."
            />

            <div className="as6-command-palette__list">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  className="as6-command-palette__item"
                  onClick={() => runCommand(command)}
                >
                  <span>
                    <strong>{command.label}</strong>
                    <small>{command.route}</small>
                  </span>
                  <em>{command.group}</em>
                </button>
              ))}

              {!filteredCommands.length ? (
                <div className="as6-command-palette__empty">No commands found</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
