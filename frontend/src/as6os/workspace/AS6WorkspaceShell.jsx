import React from 'react';
import { as6RuntimeContext } from '../index.js';
import './workspaceShell.css';
import { AS6NavigationList } from '../navigation/index.js';
import { AS6ModuleHost } from '../modules/index.js';

export function AS6WorkspaceShell({ children }) {
  return (
    <div className='as6-os-shell' data-stage={as6RuntimeContext.stage}>
      <aside className='as6-os-sidebar' aria-label='AS6 Sidebar'>
        <div className='as6-os-brand'>AS6 Core</div>
        <AS6NavigationList activeId='workspace' />
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
