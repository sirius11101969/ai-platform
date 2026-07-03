import React from 'react';
import { bootstrapAS6ApplicationFoundation, getAS6ApplicationFoundationModel } from './applicationRuntime.js';
import './applicationFoundation.css';

export function AS6ApplicationFoundation() {
  const model = getAS6ApplicationFoundationModel();
  return (
    <section className='as6-application-foundation' aria-label='AS6 Application Foundation'>
      <header className='as6-application-foundation__header'>
        <span>Application Foundation</span>
        <strong>Единый фундамент будущих приложений AS6.</strong>
      </header>
      <div className='as6-application-foundation__grid'>
        {model.applications.map((application) => (
          <button key={application.id} type='button' onClick={() => bootstrapAS6ApplicationFoundation(application.id)}>
            <b>{application.label}</b>
            <small>{application.id}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

export default AS6ApplicationFoundation;
