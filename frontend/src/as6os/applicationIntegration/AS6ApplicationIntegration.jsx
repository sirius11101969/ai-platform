import React from 'react';
import { coordinateAS6ApplicationIntegration, getAS6ApplicationIntegrationModel } from './applicationIntegrationCoordinator.js';
import './applicationIntegration.css';

export function AS6ApplicationIntegration() {
  const model = getAS6ApplicationIntegrationModel();

  return (
    <section className="as6-application-integration" aria-label="AS6 Application Integration">
      <header className="as6-application-integration__header">
        <span>Application Integration</span>
        <strong>Единая интеграция инфраструктурных подсистем Application Foundation.</strong>
      </header>
      <button type="button" onClick={() => coordinateAS6ApplicationIntegration()}>
        Coordinate Application Integration
      </button>
      <pre>{JSON.stringify(model.health.applicationIntegration, null, 2)}</pre>
    </section>
  );
}

export default AS6ApplicationIntegration;
