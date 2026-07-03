import React from 'react';
import { bootstrapAS6ExtensionPoints, getAS6ExtensionPointsModel } from './applicationExtensionController.js';
import './applicationExtensionPoints.css';

export function AS6ApplicationExtensionPoints() {
  const model = getAS6ExtensionPointsModel();

  return (
    <section className="as6-application-extension-points" aria-label="AS6 Application Extension Points">
      <header className="as6-application-extension-points__header">
        <span>Extension Points</span>
        <strong>Декларативное подключение расширений через политики и контракты.</strong>
      </header>
      <button type="button" onClick={() => bootstrapAS6ExtensionPoints()}>
        Bootstrap Extension Points
      </button>
      <pre>{JSON.stringify(model.health.extensionPoints, null, 2)}</pre>
    </section>
  );
}

export default AS6ApplicationExtensionPoints;
