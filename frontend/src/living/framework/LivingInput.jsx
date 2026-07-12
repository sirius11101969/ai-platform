import React from "react";
import "./livingFramework.css";

export function LivingInput({
  placeholder = "Расскажите, что вы хотите получить.",
  value = "",
  onChange,
  onSubmit,
  disabled = false,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!disabled && onSubmit) onSubmit(value);
  };

  return (
    <form className="as6-living-input" onSubmit={handleSubmit} aria-label="Диалог с AS6">
      <input
        className="as6-living-input__field"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        aria-label={placeholder}
      />
      <button className="as6-living-input__microphone" type="button" aria-label="Голосовой ввод" disabled={disabled}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V7a3.5 3.5 0 1 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z" />
          <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
        </svg>
      </button>
    </form>
  );
}

export default LivingInput;
