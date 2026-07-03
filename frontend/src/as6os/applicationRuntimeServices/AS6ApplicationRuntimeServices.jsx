import React from 'react';
import { bootstrapAS6RuntimeServices, getAS6RuntimeServicesModel } from './applicationRuntimeServicesController.js';
import './applicationRuntimeServices.css';

export function AS6ApplicationRuntimeServices() {
  const model = getAS6RuntimeServicesModel();

  return (
    <section className="as6-application-runtime-services" aria-label="AS6 Application Runtime Services">
      <header className="as6-application-runtime-services__header">
        <span>Runtime Services</span>
        <strong>Сервисы приложения через контракты, события и runtime context.</strong>
      </header>
      <button type="button" onClick={() => bootstrapAS6RuntimeServices()}>
        Bootstrap Runtime Services
      </button>
      <pre>{JSON.stringify(model.health.runtimeServices, null, 2)}</pre>
    </section>
  );
}

export default AS6ApplicationRuntimeServices;
