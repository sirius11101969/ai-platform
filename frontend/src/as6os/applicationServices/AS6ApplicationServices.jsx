import React from 'react';
import { bootstrapAS6ApplicationServices, getAS6ApplicationServicesModel } from './applicationServiceController.js';
import './applicationServices.css';

export function AS6ApplicationServices() {
  const model = getAS6ApplicationServicesModel();

  return (
    <section className="as6-application-services" aria-label="AS6 Application Services">
      <header className="as6-application-services__header">
        <span>Application Services</span>
        <strong>Сервисный слой приложения через контракты и lifecycle manager.</strong>
      </header>
      <button type="button" onClick={() => bootstrapAS6ApplicationServices()}>
        Bootstrap Application Services
      </button>
      <pre>{JSON.stringify(model.health.applicationServices, null, 2)}</pre>
    </section>
  );
}

export default AS6ApplicationServices;
