import React from 'react';
import { as6RuntimeContext } from '../index.js';
import './workspaceShell.css';

export function AS6WorkspaceShell({ children }) {
  return (
    <div className='as6-os-shell' data-stage={as6RuntimeContext.stage}>
      <aside className='as6-os-sidebar' aria-label='AS6 Sidebar'>
        <div className='as6-os-brand'>AS6 Core</div>
        <nav className='as6-os-nav'>
          <span>Workspace</span>
          <span>Modules</span>
          <span>Diagnostics</span>
        </nav>
      </aside>
      <section className='as6-os-body'>
        <header className='as6-os-header'>
          <div>
            <strong>AS6 Workspace</strong>
            <small>Всегда знает следующий лучший шаг.</small>
          </div>
          <button type='button'>Спросить AS6</button>
        </header>
        <main className='as6-os-main'>
          {children || <div className='as6-os-placeholder'>AS6 OS Workspace Shell готов к подключению модулей.</div>}
        </main>
      </section>
      <aside className='as6-os-right-rail' aria-label='AS6 Right Rail'>
        <strong>AS6 Assistant</strong>
        <span>Right Rail placeholder</span>
      </aside>
    </div>
  );
}

export default AS6WorkspaceShell;
