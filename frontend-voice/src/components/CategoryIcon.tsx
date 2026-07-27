type CategoryIconProps = {
  category: string;
  className?: string;
};

export function CategoryIcon({ category, className = "h-4 w-4" }: CategoryIconProps) {
  switch (category) {
    case "GROCERIES":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M6 9h12l-1.2 9.5a2 2 0 0 1-2 1.5H9.2a2 2 0 0 1-2-1.5L6 9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "FOOD":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path d="M7 3v7a2 2 0 0 0 2 2v9M7 3v9M9 3v9M17 3c-1.5 0-2.5 1.5-2.5 4s1 4 2.5 4v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "PHARMA":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "HEALTH":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M12 20s-7-4.4-9.3-8.8C1.4 8.2 3 5 6.2 5c1.8 0 3.2 1 3.8 2.3C10.6 6 12 5 13.8 5 17 5 18.6 8.2 21.3 11.2 19 15.6 12 20 12 20Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M5 12h3l1.5-2.5L11 15l1.5-4L14 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "AUTO":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M4 16v-2.5a2 2 0 0 1 .4-1.2L6 9.5A2 2 0 0 1 7.6 8.7h8.8a2 2 0 0 1 1.6.8l1.6 2.8a2 2 0 0 1 .4 1.2V16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <rect x="3" y="16" width="18" height="3" rx="1" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="7.5" cy="19" r="1.4" fill="currentColor" />
          <circle cx="16.5" cy="19" r="1.4" fill="currentColor" />
        </svg>
      );
    case "TRANSPORT":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="4" y="4" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 10h16M8 4v2M16 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="8" cy="19" r="1.4" fill="currentColor" />
          <circle cx="16" cy="19" r="1.4" fill="currentColor" />
        </svg>
      );
    case "HOUSING":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "EDUCATION":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path d="M2 8 12 4l10 4-10 4-10-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M6 10.5V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M21 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "SHOPPING":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "SUBSCRIPTIONS":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "LEISURE":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
  }
}
