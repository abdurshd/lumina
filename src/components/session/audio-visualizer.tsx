'use client';

import { useEffect, useRef } from 'react';

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
          className={`w-1 rounded-full bg-primary transition-all ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{
            height: isActive ? `${Math.random() * 24 + 8}px` : '4px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
