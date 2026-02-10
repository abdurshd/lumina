import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

const STARS = [
  { x: 30, y: 25 },
  { x: 60, y: 15 },
  { x: 90, y: 28 },
  { x: 20, y: 55 },
  { x: 55, y: 50 },
  { x: 85, y: 60 },
  { x: 35, y: 85 },
  { x: 65, y: 90 },
  { x: 95, y: 82 },
];

const LINES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
  [3, 4], [4, 5], [3, 6], [4, 7], [5, 8],
  [6, 7], [7, 8],
];

export function ConstellationLoader({ size = 120, className, label }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Loading report"
      >
        <defs>
          <filter id="constellation-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="constellation-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Background radial glow */}
        <circle cx="60" cy="60" r="55" fill="url(#constellation-bg)" />

        {/* Connection lines drawing in */}
        {LINES.map(([from, to], i) => {
          const dx = STARS[to].x - STARS[from].x;
          const dy = STARS[to].y - STARS[from].y;
          const length = Math.sqrt(dx * dx + dy * dy);
          return (
            <line
              key={`line-${i}`}
              x1={STARS[from].x}
              y1={STARS[from].y}
              x2={STARS[to].x}
              y2={STARS[to].y}
              stroke="rgba(34,211,238,0.4)"
              strokeWidth="1"
              strokeDasharray={length}
              strokeDashoffset={length}
              className="loader-constellation-draw"
              style={{ animationDelay: `${0.3 + i * 0.15}s`, animationDuration: '1.5s' }}
            />
          );
        })}

        {/* Stars appearing sequentially */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={0}
            fill="#22d3ee"
            filter="url(#constellation-glow)"
            className="loader-constellation-star"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </svg>
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}
