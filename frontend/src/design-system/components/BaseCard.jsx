import './baseCard.css';

export default function BaseCard({ children, className = '', ...props }) {
  return (
    <section className={`as6-ds-card ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
