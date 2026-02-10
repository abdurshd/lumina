import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

const BAR_HEIGHTS = [20, 30, 42, 52, 42, 30, 20];

export function WaveformLoader({ size = 120, className, label }: LoaderProps) {
  const barWidth = 10;
  const gap = 4;
  const totalWidth = BAR_HEIGHTS.length * barWidth + (BAR_HEIGHTS.length - 1) * gap;
  const offsetX = (120 - totalWidth) / 2;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        width={size}
        height={(size * 80) / 120}
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Connecting"
      >
        <defs>
          <linearGradient id="waveform-grad-0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.3)" />
          </linearGradient>
          <linearGradient id="waveform-grad-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(167,139,250,0.9)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.3)" />
          </linearGradient>
          <filter id="waveform-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center pulse ring */}
        <circle
          cx={60}
          cy={40}
          r={8}
          fill="none"
          stroke="rgba(34,211,238,0.2)"
          strokeWidth="1"
          className="loader-ring-expand"
        />

        {/* Bars */}
        {BAR_HEIGHTS.map((h, i) => {
          const x = offsetX + i * (barWidth + gap);
          const y = 40 - h / 2;
          const isCenter = i === 3;
          const gradId = i % 2 === 0 ? 'waveform-grad-0' : 'waveform-grad-1';

          return (
            <rect
              key={`bar-${i}`}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={barWidth / 2}
              fill={`url(#${gradId})`}
              filter={isCenter ? 'url(#waveform-glow)' : undefined}
              className="loader-bar-breathe"
              style={{
                transformOrigin: `${x + barWidth / 2}px 40px`,
                animationDelay: `${Math.abs(i - 3) * 0.12}s`,
              }}
            />
          );
        })}
      </svg>
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}
