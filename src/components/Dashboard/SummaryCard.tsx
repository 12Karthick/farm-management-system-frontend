import type { ReactNode } from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';
import './SummaryCard.css';

export type SummaryCardVariant = 'pink' | 'cyan' | 'teal' | 'purple' | 'orange';

export interface SummaryCardProps {
  id: string;
  label: string;           // e.g. "Company"
  title: string;           // e.g. "AgriTech Solutions"
  subtitle?: string;       // e.g. "Active Organization"
  icon: ReactNode;
  trend?: string;          // e.g. "+12% from last month"
  variant: SummaryCardVariant;
  animationDelay?: number;
  showExternalLink?: boolean;
}

export default function SummaryCard({
  id,
  label,
  title,
  subtitle,
  icon,
  trend,
  variant,
  animationDelay = 0,
  showExternalLink = false,
}: SummaryCardProps) {
  return (
    <article
      id={`summary-card-${id}`}
      className={`summary-card summary-card--${variant}`}
      style={{ animationDelay: `${animationDelay}ms`, animation: 'fadeInUp 0.45s ease both' }}
    >
      {/* Top row */}
      <div className="summary-card__top">
        <span className="summary-card__label">{label}</span>
        <div className="summary-card__top-right">
          {trend && <ArrowUpOutlined className="summary-card__trend-icon" />}
          {showExternalLink && (
            <span className="summary-card__ext-link" aria-hidden>↗</span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="summary-card__title">{title}</div>

      {/* Bottom */}
      <div className="summary-card__bottom">
        {subtitle && <span className="summary-card__subtitle">{subtitle}</span>}
        {trend && <span className="summary-card__trend">{trend}</span>}
      </div>

      {/* Icon */}
      <div className="summary-card__icon" aria-hidden="true">
        {icon}
      </div>
    </article>
  );
}
