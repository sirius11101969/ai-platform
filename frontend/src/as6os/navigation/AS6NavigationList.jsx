import React from 'react';
import { getAS6NavigationItems } from './navigationRegistry.js';

export function AS6NavigationList({ activeId = 'workspace' }) {
  return (
    <nav className='as6-os-nav' aria-label='AS6 Navigation'>
      {getAS6NavigationItems().map((item) => (
        <a key={item.id} href={item.path} className={item.id === activeId ? 'is-active' : ''} data-module={item.module}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export default AS6NavigationList;
