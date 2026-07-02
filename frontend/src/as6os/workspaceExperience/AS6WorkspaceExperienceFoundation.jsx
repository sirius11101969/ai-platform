import React from 'react';
import { AS6WorkspaceShell } from '../workspace/index.js';
import { AS6WorkspaceExperienceProvider, useAS6WorkspaceExperience } from './workspaceExperienceRuntime.jsx';

function AS6WorkspaceExperienceFoundationView() {
  const workspace = useAS6WorkspaceExperience();
  return (
    <section className='as6-workspace-experience-foundation' data-workspace-id={workspace.workspaceId}>
      <header className='as6-workspace-experience-foundation__header'>
        <span>AS6 Workspace Experience</span>
        <strong>{workspace.nextBestAction}</strong>
      </header>
      <div className='as6-workspace-experience-foundation__grid'>
        <article>
          <b>Foundation Runtime</b>
          <p>Workspace Experience подключён к AS6 Operating System V1.</p>
        </article>
        <article>
          <b>Service Bindings</b>
          <p>Workspace использует Platform Services через существующие OS-контракты.</p>
        </article>
        <article>
          <b>Diagnostics</b>
          <p>Runtime tracer и health snapshot готовы для следующих срезов.</p>
        </article>
      </div>
    </section>
  );
}

export function AS6WorkspaceExperienceFoundation({ context = {} }) {
  return (
    <AS6WorkspaceExperienceProvider value={context}>
      <AS6WorkspaceShell>
        <AS6WorkspaceExperienceFoundationView />
      </AS6WorkspaceShell>
    </AS6WorkspaceExperienceProvider>
  );
}

export default AS6WorkspaceExperienceFoundation;
