import React from 'react';
import { getAS6WorkspaceNavigationModel, activateAS6WorkspaceNavigationItem } from './navigationController.js';
import './workspaceNavigation.css';

export function AS6WorkspaceNavigation({ activeItemId = 'workspace.home' }) {
  const model = getAS6WorkspaceNavigationModel();
  return (
    <nav className='as6-workspace-navigation' aria-label='AS6 Workspace Navigation'>
      {model.groups.map((group) => (
        <section key={group.id} className='as6-workspace-navigation__group'>
          <strong>{group.label}</strong>
          {group.items.map((item) => (
            <a key={item.id} href={item.path} className={item.id === activeItemId ? 'is-active' : ''} onClick={() => activateAS6WorkspaceNavigationItem(item.id)}>
              {item.label}
            </a>
          ))}
        </section>
      ))}
    </nav>
  );
}

export default AS6WorkspaceNavigation;
