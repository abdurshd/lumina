import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

export function QuizLoader({ size = 120, className, label }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Loading quiz"
      >
        <defs>
          <filter id="quiz-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Brain outline (simplified) */}
        <g className="loader-core-breathe" filter="url(#quiz-glow)">
          <path
            d="M60 38c-8 0-15 3-18 8-4-2-9 0-10 5s2 10 6 11c-1 3 0 7 4 9 3 2 7 2 10 0 2 4 6 6 8 6s6-2 8-6c3 2 7 2 10 0 4-2 5-6 4-9 4-1 7-6 6-11s-6-7-10-5c-3-5-10-8-18-8z"
            stroke="#22d3ee"
            strokeWidth="1.5"
            fill="rgba(34,211,238,0.05)"
            strokeLinejoin="round"
          />
        </g>

        {/* Orbit 1 — diamond (fast, clockwise) */}
        <g className="loader-orbit" style={{ transformOrigin: '60px 60px', animationDuration: '3s' }}>
          <rect
            x="56"
            y="14"
            width="8"
            height="8"
            rx="1"
            fill="rgba(167,139,250,0.9)"
            transform="rotate(45 60 18)"
          />
        </g>

        {/* Orbit 2 — circle (medium, counter-clockwise) */}
        <g className="loader-orbit-reverse" style={{ transformOrigin: '60px 60px', animationDuration: '4s' }}>
          <circle cx="98" cy="60" r="4" fill="rgba(34,211,238,0.9)" />
        </g>

        {/* Orbit 3 — question mark (slow, clockwise) */}
        <g className="loader-orbit" style={{ transformOrigin: '60px 60px', animationDuration: '5s' }}>
          <text
            x="55"
            y="110"
            fill="rgba(249,115,22,0.9)"
            fontSize="12"
            fontWeight="bold"
            fontFamily="system-ui"
          >
            ?
          </text>
        </g>

        {/* Thought dots */}
        {[0, 1, 2].map((i) => (
          <circle
            key={`dot-${i}`}
            cx={42 + i * 8}
            cy={38 - i * 4}
            r={2 - i * 0.4}
            fill="rgba(34,211,238,0.5)"
            className="loader-fade-sequence"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </svg>
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}
