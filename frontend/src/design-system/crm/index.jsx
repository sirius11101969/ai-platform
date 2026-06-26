import BaseCard from '../components/BaseCard';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import './as6CrmComponents.css';

export function As6CrmCard({ children, className = '', ...props }) {
  return <BaseCard className={`as6-crm-card ${className}`.trim()} {...props}>{children}</BaseCard>;
}

export function As6CrmPrimaryButton(props) {
  return <PrimaryButton {...props} />;
}

export function As6CrmSecondaryButton(props) {
  return <SecondaryButton {...props} />;
}
