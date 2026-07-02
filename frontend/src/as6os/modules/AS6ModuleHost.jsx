import React from 'react';
import { resolveAS6HostedModule } from './moduleHost.js';

export function AS6ModuleHost({ moduleId = 'workspace', fallback = null }) {
  const module = resolveAS6HostedModule(moduleId);
  if (!module) {
    return fallback || <section className='as6-module-host as6-module-host-empty'>AS6 module is not registered.</section>;
  }
  return (
    <section className='as6-module-host' data-module-id={module.id}>
      <header className='as6-module-host-header'>
        <strong>{module.label}</strong>
        <span>{module.status}</span>
      </header>
      <div className='as6-module-host-body'>
        {module.render ? module.render(module) : <p>Module Host готов к безопасному подключению модуля.</p>}
      </div>
    </section>
  );
}

export default AS6ModuleHost;
