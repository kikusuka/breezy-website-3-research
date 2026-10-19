import React from 'react';

interface BreezyLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const BreezyLogo: React.FC<BreezyLogoProps> = ({
  className = '',
  size = 32,
  showWordmark = false,
  wordmarkClassName = '',
}) => {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric SVG Logo Mark */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(76,214,251,0.25)] transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id={`breezy-cyan-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4cd6fb" />
              <stop offset="50%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#0077b6" />
            </linearGradient>
            <linearGradient id={`breezy-accent-grad-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7bd0ff" />
              <stop offset="60%" stopColor="#4cd6fb" />
              <stop offset="100%" stopColor="#0096c7" />
            </linearGradient>
            <linearGradient id={`breezy-glow-grad-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#4edea3" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4cd6fb" stopOpacity="0.9" />
            </linearGradient>
            <filter id={`breezy-inner-shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background subtle hexagon matrix base */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="10"
            fill="#141820"
            stroke="#272a30"
            strokeWidth="1.5"
          />

          {/* Outer Dynamic Aerodynamic Ribbon (Flowing upper wing) */}
          <path
            d="M 12 16 C 12 14 14 12 17 12 L 29 12 C 34 12 37 15 37 19 C 37 22.5 34.5 25 31 25.5 L 19 25.5 C 16.5 25.5 14.5 24 14.5 21.5 C 14.5 19 16.5 17.5 19 17.5 L 30 17.5"
            stroke={`url(#breezy-cyan-grad-${uid})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lower Convergent Ribbon (Flowing research council anchor) */}
          <path
            d="M 36 32 C 36 34 34 36 31 36 L 19 36 C 14 36 11 33 11 29 C 11 25.5 13.5 23 17 22.5 L 29 22.5 C 31.5 22.5 33.5 24 33.5 26.5 C 33.5 29 31.5 30.5 29 30.5 L 18 30.5"
            stroke={`url(#breezy-accent-grad-${uid})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Neural Nexus Point (Intersection of multi-model consensus) */}
          <circle cx="24" cy="24" r="3.2" fill={`url(#breezy-glow-grad-${uid})`} />
          <circle cx="24" cy="24" r="1.2" fill="#ffffff" />
        </svg>
      </div>

      {/* Wordmark Branding */}
      {showWordmark && (
        <div className={`flex flex-col text-left ${wordmarkClassName}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-base tracking-tight text-on-surface">
              Breezy
            </span>
            <span className="px-1.5 py-0.5 rounded bg-primary/15 border border-primary/30 text-primary font-mono text-[9px] uppercase font-bold tracking-wider">
              Research
            </span>
          </div>
          <span className="font-mono text-[10px] text-outline tracking-tight mt-0.5">
            Truth-First Multi-Model Council
          </span>
        </div>
      )}
    </div>
  );
};
