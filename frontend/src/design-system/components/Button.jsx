import './button.css';

export function PrimaryButton({ children, className = '', ...props }) {
  return <button className={`as6-ds-button as6-ds-button--primary ${className}`.trim()} {...props}>{children}</button>;
}

export function SecondaryButton({ children, className = '', ...props }) {
  return <button className={`as6-ds-button as6-ds-button--secondary ${className}`.trim()} {...props}>{children}</button>;
}
