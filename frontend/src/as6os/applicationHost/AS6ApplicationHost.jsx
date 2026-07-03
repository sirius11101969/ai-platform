import React from 'react';
import { activateAS6ApplicationHost, getAS6ApplicationHostModel } from './applicationHostController.js';
import './applicationHost.css';

export function AS6ApplicationHost() {
  const model = getAS6ApplicationHostModel();

  return (
    <section className="as6-application-host" aria-label="AS6 Application Host">
      <header className="as6-application-host__header">
        <span>Application Host</span>
        <strong>Декларативный запуск приложений AS6.</strong>
      </header>
      <button type="button" onClick={() => activateAS6ApplicationHost()}>
        Activate Application Host
      </button>
      <pre>{JSON.stringify(model.health.applicationHost, null, 2)}</pre>
    </section>
  );
}

export default AS6ApplicationHost;
