import React from 'react';
import { bootstrapAS6ApplicationShell, getAS6ApplicationShellModel } from './applicationShellController.js';
import './applicationShell.css';

export function AS6ApplicationShell() {
  const model = getAS6ApplicationShellModel();

  return (
    <section className="as6-application-shell" aria-label="AS6 Application Shell">
      <header className="as6-application-shell__header">
        <span>Application Shell</span>
        <strong>Композиция приложений без владения содержимым.</strong>
      </header>
      <button type="button" onClick={() => bootstrapAS6ApplicationShell()}>
        Bootstrap Application Shell
      </button>
      <pre>{JSON.stringify(model.health.applicationShell, null, 2)}</pre>
    </section>
  );
}

export default AS6ApplicationShell;
