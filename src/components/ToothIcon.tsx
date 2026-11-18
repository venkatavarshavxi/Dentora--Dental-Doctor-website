interface ToothIconProps {
  className?: string;
}

export function ToothIcon({ className = 'h-6 w-6' }: ToothIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7.5 3.5C5.2 3.5 3.5 5.4 3.5 8c0 2.6.9 4.7 1.6 6.8.7 2.2 1.2 4.9 2.4 5.6.9.5 1.8-.3 2.3-1.8.4-1.3 1.1-2.6 2.2-2.6s1.8 1.3 2.2 2.6c.5 1.5 1.4 2.3 2.3 1.8 1.2-.7 1.7-3.4 2.4-5.6.7-2.1 1.6-4.2 1.6-6.8 0-2.6-1.7-4.5-4-4.5-1.5 0-2.6.7-3.5 1.2-.5.3-1.5.3-2 0C10.1 4.2 9 3.5 7.5 3.5Z" />
      <path d="M7.5 7.2c.6-.7 1.4-1.1 2.3-1.1" />
    </svg>
  );
}
