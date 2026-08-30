// Ikona aplikacije - oblak z bliskom, ista glifa in barvna shema (#6d5cf5 -> #facc15)
// kot ikona za Viharnik na TomsStudios (glej TomsStudios/index.html).
// Uporablja se v headerju in za generiranje favicon/PWA ikon (glej public/icon-*.png, app/favicon.ico).
export default function AppIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Viharnik"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="app-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(50)">
          <stop offset="0%" stopColor="#6d5cf5" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="8.9" fill="url(#app-icon-grad)" />
      <g
        transform="translate(8 8) scale(1)"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
        <path d="M13 11 9 17h6l-4 6" />
      </g>
    </svg>
  );
}
