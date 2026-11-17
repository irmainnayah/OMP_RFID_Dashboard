import { ServiceStatus } from '@/types/bay';

interface StatusBadgeProps {
  /** Size variant: default for cards, small for compact contexts */
  status: ServiceStatus;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Compact operational status indicator.
 *
 * Status is communicated through:
 * - semantic icon
 * - explicit text
 * - restrained functional color
 *
 * Visual direction:
 * - industrial
 * - clean
 * - low visual weight
 * - no shadow
 * - not button-like
 */
export function StatusBadge({
  status,
  size = 'md',
}: StatusBadgeProps) {
  const configs = {
    IN_SERVICE: {
      label: 'IN SERVICE',
      textClass: 'text-[#147A5A]',
      borderClass: 'border-[#9AD9C3]',
      bgClass: 'bg-[#F2FBF7]',
      icon: (
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[#16845F]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          />
        </svg>
      ),
    },

    READY: {
      label: 'READY',
      textClass: 'text-[#1769A6]',
      borderClass: 'border-[#9CCBEA]',
      bgClass: 'bg-[#F2F8FD]',
      icon: (
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[#1673B7]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },

    OVERDUE: {
      label: 'OVERDUE',
      textClass: 'text-[#B63845]',
      borderClass: 'border-[#E6AAB1]',
      bgClass: 'bg-[#FFF5F6]',
      icon: (
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[#C23C49]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 18.75h.007v.008H12v-.008z"
          />
        </svg>
      ),
    },
  };

  const config = configs[status];

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px] gap-1.5',
    md: 'px-2.5 py-1.5 text-[11px] gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
  };

  return (
    <div
      className={`
        inline-flex
        items-center
        rounded-[6px]
        border
        font-medium
        leading-none
        tracking-[0.06em]
        whitespace-nowrap

        ${config.bgClass}
        ${config.borderClass}
        ${config.textClass}
        ${sizeClasses[size]}
      `}
      role="status"
      aria-label={`Service status: ${config.label}`}
    >
      {config.icon}

      <span>
        {config.label}
      </span>
    </div>
  );
}