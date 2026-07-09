import React from "react";
import { getAS6LivingStateList } from "./livingStates.js";
import "./LivingStateSwitcher.css";

export default function LivingStateSwitcher({ value, onChange }) {
  const states = getAS6LivingStateList();

  return (
    <nav className="living-state-switcher" aria-label="Состояния AS6 Living Space">
      {states.map((state) => (
        <button
          key={state.id}
          type="button"
          className={state.id === value ? "living-state-switcher__item living-state-switcher__item--active" : "living-state-switcher__item"}
          onClick={() => onChange(state.id)}
          aria-pressed={state.id === value}
        >
          <span>{state.title}</span>
        </button>
      ))}
    </nav>
  );
}
