'use client';

interface AudioVisualizerProps {
  isActive: boolean;
}

const BARS_COUNT = 12;

// Pre-compute random bar styles at module level to avoid impure function calls during render
const BAR_STYLES = Array.from({ length: BARS_COUNT }, (_, i) => ({
  height: `${Math.random() * 24 + 8}px`,
  animationDelay: `${i * 0.08}s`,
  animationDuration: `${0.4 + Math.random() * 0.4}s`,
}));

export function AudioVisualizer({ isActive }: AudioVisualizerProps) {
  const barStyles = BAR_STYLES;

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {barStyles.map((style, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all origin-bottom ${
            isActive ? 'animate-audio-bar' : ''
          }`}
          style={{
            height: isActive ? style.height : '4px',
            animationDelay: style.animationDelay,
            animationDuration: style.animationDuration,
            background: isActive
              ? `linear-gradient(to top, #22c55e, #4ade80)`
              : 'var(--overlay-heavy)',
            boxShadow: 'none',
          }}
        />
      ))}
    </div>
  );
}
