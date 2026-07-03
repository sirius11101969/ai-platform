import React from 'react';
import { activateAS6Command, getAS6CommandPaletteModel } from './commandPaletteController.js';
import './commandPalette.css';

export function AS6CommandPalette({ activeCommandId = 'workspace.focus' }) {
  const model = getAS6CommandPaletteModel();

  return (
    <section className="as6-command-palette" aria-label="AS6 Command Palette">
      <header className="as6-command-palette__header">
        <span>Command Palette</span>
        <strong>Всегда знает следующий лучший шаг.</strong>
      </header>
      <div className="as6-command-palette__groups">
        {model.groups.map((group) => (
          <section key={group.id} className="as6-command-palette__group">
            <b>{group.label}</b>
            {group.commands.map((command) => (
              <button key={command.id} type="button" className={command.id === activeCommandId ? 'is-active' : ''} onClick={() => activateAS6Command(command.id)}>
                {command.label}
              </button>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

export default AS6CommandPalette;
