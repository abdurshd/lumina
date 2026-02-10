import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

const NODES = [
  { x: 60, y: 60 }, // center
  { x: 60, y: 30 }, // top
  { x: 86, y: 45 }, // top-right
  { x: 86, y: 75 }, // bottom-right
  { x: 60, y: 90 }, // bottom
  { x: 34, y: 75 }, // bottom-left
  { x: 34, y: 45 }, // top-left
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
];

export function NeuralLoader({ size = 120, className, label }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Loading"
      >
        <defs>
          <filter id="neural-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {CONNECTIONS.map(([from, to], i) => (
          <line
            key={`conn-${i}`}
            x1={NODES[from].x}
            y1={NODES[from].y}
            x2={NODES[to].x}
            y2={NODES[to].y}
            stroke="rgba(34,211,238,0.15)"
            strokeWidth="1"
          />
        ))}

        {/* Signal pulses along connections */}
        {CONNECTIONS.map(([from, to], i) => (
          <line
            key={`signal-${i}`}
            x1={NODES[from].x}
            y1={NODES[from].y}
            x2={NODES[to].x}
            y2={NODES[to].y}
            stroke="rgba(34,211,238,0.6)"
            strokeWidth="1.5"
            strokeDasharray="4 16"
            className="loader-signal-travel"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}

        {/* Sonar ring from center */}
        <circle
          cx={60}
          cy={60}
          r={8}
          fill="none"
          stroke="rgba(34,211,238,0.3)"
          strokeWidth="1"
          className="loader-ring-expand"
        />
        <circle
          cx={60}
          cy={60}
          r={8}
          fill="none"
          stroke="rgba(34,211,238,0.2)"
          strokeWidth="1"
          className="loader-ring-expand"
          style={{ animationDelay: '1s' }}
        />

        {/* Outer nodes */}
        {NODES.slice(1).map((node, i) => (
          <circle
            key={`node-${i}`}
            cx={node.x}
            cy={node.y}
            r={3}
            fill="rgba(34,211,238,0.8)"
            className="loader-node-pulse"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}

        {/* Center node with glow */}
        <circle
          cx={60}
          cy={60}
          r={5}
          fill="#22d3ee"
          filter="url(#neural-glow)"
          className="loader-core-breathe"
        />
      </svg>
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}
