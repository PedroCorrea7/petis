export function PetisLogo({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Petis"
    >
      <circle cx="32" cy="32" r="30" fill="var(--primary)" opacity="0.12" />
      {/* paw pad */}
      <path
        d="M32 46c-7 0-12-4-12-9 0-4 4-7 12-7s12 3 12 7c0 5-5 9-12 9z"
        fill="var(--primary)"
      />
      {/* toes */}
      <ellipse cx="22" cy="26" rx="3.5" ry="5" fill="var(--primary)" />
      <ellipse cx="42" cy="26" rx="3.5" ry="5" fill="var(--primary)" />
      <ellipse cx="28" cy="19" rx="3" ry="4.5" fill="var(--primary)" />
      <ellipse cx="36" cy="19" rx="3" ry="4.5" fill="var(--primary)" />
      {/* heart on pad */}
      <path
        d="M32 41.5l-3.2-2.9c-1.6-1.4-1.6-3.8 0-5.2 1.4-1.2 3.4-.8 4.2.6.8-1.4 2.8-1.8 4.2-.6 1.6 1.4 1.6 3.8 0 5.2L32 41.5z"
        fill="var(--accent)"
      />
    </svg>
  );
}
