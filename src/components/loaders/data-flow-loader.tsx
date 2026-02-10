import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

const STREAMS = [
  { id: 'top', path: 'M60,10 L60,48', color: 'rgba(34,211,238,0.7)' },
  { id: 'right', path: 'M110,60 L72,60', color: 'rgba(167,139,250,0.7)' },
  { id: 'bottom', path: 'M60,110 L60,72', color: 'rgba(249,115,22,0.7)' },
  { id: 'left', path: 'M10,60 L48,60', color: 'rgba(34,211,238,0.7)' },
];

export function DataFlowLoader({ size = 120, className, label }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Analyzing data"
      >
        <defs>
          <filter id="dataflow-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {STREAMS.map((stream) => (
            <path key={`path-${stream.id}`} id={`stream-${stream.id}`} d={stream.path} />
          ))}
        </defs>

        {/* Expanding rings */}
        <circle
          cx={60}
          cy={60}
          r={8}
          fill="none"
          stroke="rgba(34,211,238,0.2)"
          strokeWidth="1"
          className="loader-ring-expand"
        />
        <circle
          cx={60}
          cy={60}
          r={8}
          fill="none"
          stroke="rgba(167,139,250,0.15)"
          strokeWidth="1"
          className="loader-ring-expand"
          style={{ animationDelay: '0.7s' }}
        />
        <circle
          cx={60}
          cy={60}
          r={8}
          fill="none"
          stroke="rgba(249,115,22,0.1)"
          strokeWidth="1"
          className="loader-ring-expand"
          style={{ animationDelay: '1.4s' }}
        />

        {/* Stream paths (faint tracks) */}
        {STREAMS.map((stream) => (
          <path
            key={`track-${stream.id}`}
            d={stream.path}
            stroke="rgba(34,211,238,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        {/* Particles flowing along paths */}
        {STREAMS.map((stream, si) =>
          [0, 1, 2].map((pi) => (
            <circle key={`p-${stream.id}-${pi}`} r="2.5" fill={stream.color} className="loader-particle-rise" style={{ animationDelay: `${si * 0.3 + pi * 0.5}s` }}>
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                begin={`${si * 0.3 + pi * 0.5}s`}
              >
                <mpath href={`#stream-${stream.id}`} />
              </animateMotion>
            </circle>
          ))
        )}

        {/* Central hexagonal node */}
        <polygon
          points="60,50 69,55 69,65 60,70 51,65 51,55"
          fill="rgba(34,211,238,0.15)"
          stroke="#22d3ee"
          strokeWidth="1.5"
          filter="url(#dataflow-glow)"
          className="loader-core-breathe"
          style={{ transformOrigin: '60px 60px' }}
        />
      </svg>
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}
