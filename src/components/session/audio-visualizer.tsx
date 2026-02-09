'use client';

interface AudioVisualizerProps {
  isActive: boolean;
}

export function AudioVisualizer({ isActive }: AudioVisualizerProps) {
  const barsCount = 12;

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: barsCount }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all origin-bottom ${
            isActive ? 'animate-audio-bar' : ''
          }`}
          style={{
            height: isActive ? `${Math.random() * 24 + 8}px` : '4px',
            animationDelay: `${i * 0.08}s`,
            animationDuration: `${0.4 + Math.random() * 0.4}s`,
            background: isActive
              ? `linear-gradient(to top, #22c55e, #4ade80)`
              : 'rgba(255,255,255,0.15)',
            boxShadow: 'none',
          }}
        />
      ))}
    </div>
  );
}
