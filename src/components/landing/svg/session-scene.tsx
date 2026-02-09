'use client';

export function SessionScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 bg-background" />

      <svg
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sess-wave-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sess-wave-grad-2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
          <filter id="sess-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sess-glow-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Nebula radial gradients */}
          <radialGradient id="sess-nebula-teal" cx="30%" cy="60%" r="40%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.06)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
          <radialGradient id="sess-nebula-purple" cx="70%" cy="40%" r="35%">
            <stop offset="0%" stopColor="rgba(167,139,250,0.05)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0)" />
          </radialGradient>
        </defs>

        {/* Nebula background blobs */}
        <rect width="100%" height="100%" fill="url(#sess-nebula-teal)" />
        <rect width="100%" height="100%" fill="url(#sess-nebula-purple)" />

        {/* Background star particles (20+) */}
        <circle cx="80" cy="60" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0s' }} />
        <circle cx="200" cy="180" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.4s' }} />
        <circle cx="350" cy="100" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.9s' }} />
        <circle cx="550" cy="150" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.3s' }} />
        <circle cx="750" cy="80" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.2s' }} />
        <circle cx="1150" cy="100" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.7s' }} />
        <circle cx="1350" cy="70" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.6s' }} />
        <circle cx="1550" cy="150" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.0s' }} />
        <circle cx="1750" cy="90" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.1s' }} />
        <circle cx="1870" cy="200" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.8s' }} />
        <circle cx="100" cy="900" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.5s' }} />
        <circle cx="300" cy="980" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.3s' }} />
        <circle cx="600" cy="950" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.2s' }} />
        <circle cx="850" cy="990" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.7s' }} />
        <circle cx="1100" cy="970" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.9s' }} />
        <circle cx="1400" cy="950" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.5s' }} />
        <circle cx="1650" cy="980" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.4s' }} />
        <circle cx="1850" cy="920" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.4s' }} />
        <circle cx="50" cy="500" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.0s' }} />
        <circle cx="1890" cy="600" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.6s' }} />
        <circle cx="960" cy="40" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.1s' }} />
        <circle cx="960" cy="1050" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.1s' }} />

        {/* --- Left Side: Human Silhouette (detailed head/shoulders) --- */}
        <g transform="translate(480, 500)">
          {/* Head */}
          <ellipse cx="0" cy="-40" rx="42" ry="48" fill="var(--svg-fill-card)" stroke="var(--svg-stroke-subtle)" strokeWidth="1.5" />
          {/* Neck */}
          <rect x="-14" y="6" width="28" height="20" fill="var(--svg-fill-card)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
          {/* Shoulders */}
          <path d="M-14 26 Q-14 26 -80 60 Q-90 65 -90 80 L-90 140 L90 140 L90 80 Q90 65 80 60 Q14 26 14 26"
            fill="var(--svg-fill-card)" stroke="var(--svg-stroke-subtle)" strokeWidth="1.5" />
          {/* Subtle face features */}
          <circle cx="-12" cy="-45" r="3" fill="var(--svg-fill-dim)" />
          <circle cx="12" cy="-45" r="3" fill="var(--svg-fill-dim)" />
          <path d="M-6 -30 Q0 -25 6 -30" fill="none" stroke="var(--svg-stroke-dim)" strokeWidth="1" />
          {/* Glow around human */}
          <ellipse cx="0" cy="40" rx="110" ry="120" fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="1" className="svg-breathe" style={{ transformOrigin: '480px 540px' }} />
        </g>

        {/* --- Right Side: AI Crystal (multi-faceted diamond with inner glow) --- */}
        <g transform="translate(1440, 500)" filter="url(#sess-glow)">
          {/* Outer diamond */}
          <path d="M0 -90 L70 0 L0 90 L-70 0 Z" fill="rgba(34,211,238,0.06)" stroke="#22d3ee" strokeWidth="2" />
          {/* Inner facets */}
          <path d="M0 -90 L25 -20 L0 0 L-25 -20 Z" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
          <path d="M70 0 L25 -20 L0 0 L25 25 Z" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
          <path d="M0 90 L25 25 L0 0 L-25 25 Z" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
          <path d="M-70 0 L-25 -20 L0 0 L-25 25 Z" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
          {/* Inner glow core */}
          <circle r="20" fill="rgba(34,211,238,0.15)" className="svg-glow-pulse" />
          <circle r="8" fill="rgba(34,211,238,0.3)" />
        </g>

        {/* --- Center: Audio Waves (3+ sinusoidal waveforms) --- */}
        <g transform="translate(960, 500)">
          <path d="M-350 0 Q -250 -60 -150 0 Q -50 60 50 0 Q 150 -60 250 0 Q 350 60 400 0"
            fill="none" stroke="url(#sess-wave-grad)" strokeWidth="2.5" opacity="0.8"
            className="svg-breathe" style={{ animationDuration: '3s', transformOrigin: '960px 500px' }} />
          <path d="M-350 0 Q -250 50 -150 0 Q -50 -50 50 0 Q 150 50 250 0 Q 350 -50 400 0"
            fill="none" stroke="url(#sess-wave-grad)" strokeWidth="2" opacity="0.5"
            className="svg-breathe" style={{ animationDuration: '3.5s', animationDelay: '0.5s', transformOrigin: '960px 500px' }} />
          <path d="M-350 0 Q -250 -35 -150 0 Q -50 35 50 0 Q 150 -35 250 0 Q 350 35 400 0"
            fill="none" stroke="url(#sess-wave-grad-2)" strokeWidth="1.5" opacity="0.4"
            className="svg-breathe" style={{ animationDuration: '4s', animationDelay: '1s', transformOrigin: '960px 500px' }} />
        </g>

        {/* --- Audio Visualization Bars --- */}
        <g transform="translate(920, 620)">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect
              key={i}
              x={i * 12}
              y={-15}
              width="6"
              height="30"
              rx="3"
              fill="rgba(34,211,238,0.3)"
              style={{
                transformOrigin: `${920 + i * 12 + 3}px 620px`,
                animation: `audioBar 1s ease-in-out infinite`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </g>

        {/* --- Floating Insight Bubbles (5+) --- */}
        <g className="svg-float" style={{ animationDuration: '7s' }}>
          <rect x="750" y="280" width="160" height="36" rx="18" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
          <text x="830" y="303" textAnchor="middle" fill="#22d3ee" fontSize="12" fontFamily="sans-serif">Interest Detected</text>
        </g>

        <g className="svg-float" style={{ animationDuration: '8s', animationDelay: '1.5s' }}>
          <rect x="1080" y="680" width="150" height="36" rx="18" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
          <text x="1155" y="703" textAnchor="middle" fill="#a78bfa" fontSize="12" fontFamily="sans-serif">High Engagement</text>
        </g>

        <g className="svg-float" style={{ animationDuration: '9s', animationDelay: '3s' }}>
          <rect x="680" y="700" width="170" height="36" rx="18" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
          <text x="765" y="723" textAnchor="middle" fill="#f97316" fontSize="12" fontFamily="sans-serif">Confidence: High</text>
        </g>

        <g className="svg-float" style={{ animationDuration: '7.5s', animationDelay: '5s' }}>
          <rect x="1050" y="330" width="140" height="36" rx="18" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
          <text x="1120" y="353" textAnchor="middle" fill="#22d3ee" fontSize="12" fontFamily="sans-serif">Active Listening</text>
        </g>

        <g className="svg-float" style={{ animationDuration: '8.5s', animationDelay: '7s' }}>
          <rect x="820" y="750" width="150" height="36" rx="18" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
          <text x="895" y="773" textAnchor="middle" fill="#a78bfa" fontSize="12" fontFamily="sans-serif">Creative Pattern</text>
        </g>
      </svg>
    </div>
  );
}
