export function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <ellipse cx="8" cy="8" rx="3" ry="6.5" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" />
      <line x1="2.3" y1="5" x2="13.7" y2="5" />
      <line x1="2.3" y1="11" x2="13.7" y2="11" />
    </svg>
  );
}

export function IOSIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="3.5" y="0.8" width="9" height="14.4" rx="2.2" />
      <line x1="6.2" y1="3" x2="9.8" y2="3" strokeWidth="1" />
      <circle cx="8" cy="12.8" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AndroidIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5 C3.5 5.8 5.5 4 8 4 C10.5 4 12.5 5.8 12.5 8.5 L12.5 11.5 C12.5 12.1 12 12.5 11.5 12.5 L4.5 12.5 C4 12.5 3.5 12.1 3.5 11.5 Z" />
      <line x1="5.8" y1="4.3" x2="4.3" y2="2" />
      <line x1="10.2" y1="4.3" x2="11.7" y2="2" />
      <circle cx="5.8" cy="8.2" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="8.2" r="0.75" fill="currentColor" stroke="none" />
      <line x1="5.8" y1="12.5" x2="5.8" y2="15" />
      <line x1="10.2" y1="12.5" x2="10.2" y2="15" />
    </svg>
  );
}

export function CLIIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="M4 6.2 L6.1 8 L4 9.8" />
      <line x1="7.4" y1="10" x2="11.6" y2="10" />
    </svg>
  );
}

export function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
