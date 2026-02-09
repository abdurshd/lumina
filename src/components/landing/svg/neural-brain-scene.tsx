'use client';

export function NeuralBrainScene() {
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
          <radialGradient id="brain-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.15)" />
            <stop offset="60%" stopColor="rgba(34,211,238,0.04)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
          <filter id="brain-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx="960" cy="540" r="450" fill="url(#brain-glow)" />

        {/* Background scattered dots */}
        <circle cx="200" cy="150" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0s' }} />
        <circle cx="400" cy="100" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.5s' }} />
        <circle cx="650" cy="80" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.2s' }} />
        <circle cx="1300" cy="120" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.8s' }} />
        <circle cx="1550" cy="90" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.6s' }} />
        <circle cx="1750" cy="180" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.3s' }} />
        <circle cx="150" cy="900" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.0s' }} />
        <circle cx="450" cy="970" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.0s' }} />
        <circle cx="1500" cy="950" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.8s' }} />
        <circle cx="1780" cy="900" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.6s' }} />

        {/* Decorative: thin connection lines radiating outward from brain center */}
        <g stroke="rgba(34,211,238,0.04)" strokeWidth="0.5">
          <line x1="960" y1="540" x2="300" y2="200" />
          <line x1="960" y1="540" x2="1650" y2="180" />
          <line x1="960" y1="540" x2="200" y2="700" />
          <line x1="960" y1="540" x2="1700" y2="750" />
          <line x1="960" y1="540" x2="500" y2="950" />
          <line x1="960" y1="540" x2="1400" y2="950" />
          <line x1="960" y1="540" x2="100" y2="540" />
          <line x1="960" y1="540" x2="1820" y2="540" />
        </g>

        {/* --- Low-Poly Brain Structure (12+ facets) --- */}
        <g transform="translate(960, 540) scale(1.3)" stroke="#22d3ee" strokeWidth="1">

          {/* Left hemisphere facets */}
          <path d="M-20 -90 L-100 -60 L-80 -10 L-20 -30 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '0s' }} />
          <path d="M-100 -60 L-160 -20 L-140 40 L-80 -10 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '0.4s' }} />
          <path d="M-160 -20 L-200 30 L-170 80 L-140 40 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '0.8s' }} />
          <path d="M-80 -10 L-140 40 L-100 90 L-30 60 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '1.2s' }} />
          <path d="M-140 40 L-170 80 L-120 110 L-100 90 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '1.6s' }} />
          <path d="M-20 -30 L-80 -10 L-30 60 L-20 20 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '2.0s' }} />

          {/* Right hemisphere facets */}
          <path d="M20 -90 L100 -60 L80 -10 L20 -30 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '0.2s' }} />
          <path d="M100 -60 L160 -20 L140 40 L80 -10 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '0.6s' }} />
          <path d="M160 -20 L200 30 L170 80 L140 40 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '1.0s' }} />
          <path d="M80 -10 L140 40 L100 90 L30 60 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '1.4s' }} />
          <path d="M140 40 L170 80 L120 110 L100 90 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '1.8s' }} />
          <path d="M20 -30 L80 -10 L30 60 L20 20 Z" fill="rgba(34,211,238,0.05)" className="svg-pulse-fill" style={{ animationDelay: '2.2s' }} />

          {/* Central bridge */}
          <path d="M-20 -90 L20 -90 L20 -30 L-20 -30 Z" fill="rgba(34,211,238,0.03)" className="svg-pulse-fill" style={{ animationDelay: '0.3s' }} />
          <path d="M-30 60 L30 60 L20 20 L-20 20 Z" fill="rgba(34,211,238,0.03)" className="svg-pulse-fill" style={{ animationDelay: '1.5s' }} />

          {/* Internal synapse connections with draw animation */}
          <line x1="-100" y1="-60" x2="100" y2="-60" strokeOpacity="0.3" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '0.5s' }} />
          <line x1="-160" y1="-20" x2="160" y2="-20" strokeOpacity="0.2" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '0.8s' }} />
          <line x1="-200" y1="30" x2="200" y2="30" strokeOpacity="0.2" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '1.1s' }} />
          <line x1="-140" y1="40" x2="140" y2="40" strokeOpacity="0.3" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '1.4s' }} />
          <line x1="-100" y1="90" x2="100" y2="90" strokeOpacity="0.3" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '1.7s' }} />
          <line x1="-80" y1="-10" x2="80" y2="-10" strokeOpacity="0.4" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '0.3s' }} />
          <line x1="-30" y1="60" x2="30" y2="60" strokeOpacity="0.4" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '2.0s' }} />
          {/* Diagonal connections */}
          <line x1="-100" y1="-60" x2="80" y2="-10" strokeOpacity="0.15" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '2.3s' }} />
          <line x1="100" y1="-60" x2="-80" y2="-10" strokeOpacity="0.15" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '2.6s' }} />
          <line x1="-140" y1="40" x2="100" y2="90" strokeOpacity="0.15" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '2.9s' }} />
          <line x1="140" y1="40" x2="-100" y2="90" strokeOpacity="0.15" strokeDasharray="500" strokeDashoffset="500" className="svg-draw-path" style={{ animationDelay: '3.2s' }} />

          {/* Glowing intersection nodes at polygon vertices */}
          <circle cx="-20" cy="-90" r="3" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '0s' }} />
          <circle cx="20" cy="-90" r="3" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '0.3s' }} />
          <circle cx="-100" cy="-60" r="2.5" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '0.6s' }} />
          <circle cx="100" cy="-60" r="2.5" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '0.9s' }} />
          <circle cx="-160" cy="-20" r="2" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '1.2s' }} />
          <circle cx="160" cy="-20" r="2" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '1.5s' }} />
          <circle cx="-200" cy="30" r="2" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '1.8s' }} />
          <circle cx="200" cy="30" r="2" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '2.1s' }} />
          <circle cx="-120" cy="110" r="2.5" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '2.4s' }} />
          <circle cx="120" cy="110" r="2.5" fill="#22d3ee" className="svg-pulse-node" filter="url(#brain-node-glow)" style={{ animationDelay: '2.7s' }} />
        </g>

        {/* --- Floating Quiz Cards (5+) with drift animation --- */}
        {/* Card 1 — top-left, tilted */}
        <g className="svg-drift" style={{ animationDuration: '12s' }}>
          <g transform="rotate(-15 620 320)">
            <rect x="570" y="260" width="100" height="130" rx="8" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
            <text x="620" y="300" textAnchor="middle" fill="var(--svg-text-faint)" fontSize="32">?</text>
            {/* Faux radio buttons */}
            <circle cx="595" cy="330" r="5" fill="none" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
            <line x1="608" y1="330" x2="645" y2="330" stroke="var(--svg-stroke-dim)" strokeWidth="2" />
            <circle cx="595" cy="350" r="5" fill="none" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
            <line x1="608" y1="350" x2="640" y2="350" stroke="var(--svg-stroke-dim)" strokeWidth="2" />
            <circle cx="595" cy="370" r="5" fill="rgba(34,211,238,0.3)" stroke="rgba(34,211,238,0.4)" strokeWidth="1" />
            <line x1="608" y1="370" x2="650" y2="370" stroke="rgba(34,211,238,0.15)" strokeWidth="2" />
          </g>
        </g>

        {/* Card 2 — right side, tilted opposite */}
        <g className="svg-drift" style={{ animationDuration: '14s', animationDelay: '3s' }}>
          <g transform="rotate(10 1300 420)">
            <rect x="1250" y="360" width="100" height="130" rx="8" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
            <circle cx="1280" cy="400" r="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <circle cx="1280" cy="425" r="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <circle cx="1280" cy="450" r="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="1295" y1="400" x2="1330" y2="400" stroke="var(--svg-stroke-dim)" strokeWidth="2" />
            <line x1="1295" y1="425" x2="1325" y2="425" stroke="var(--svg-stroke-dim)" strokeWidth="2" />
            <line x1="1295" y1="450" x2="1335" y2="450" stroke="var(--svg-stroke-dim)" strokeWidth="2" />
          </g>
        </g>

        {/* Card 3 — bottom-left */}
        <g className="svg-drift" style={{ animationDuration: '16s', animationDelay: '6s' }}>
          <g transform="rotate(-8 550 720)">
            <rect x="500" y="660" width="100" height="120" rx="8" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-dim)" strokeWidth="1" />
            <text x="550" y="700" textAnchor="middle" fill="var(--svg-text-faint)" fontSize="24">?</text>
            <rect x="520" y="720" width="60" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
            <rect x="520" y="735" width="45" height="6" rx="3" fill="var(--svg-fill-dim)" />
            <rect x="520" y="750" width="55" height="6" rx="3" fill="rgba(34,211,238,0.1)" />
          </g>
        </g>

        {/* Card 4 — top-right */}
        <g className="svg-drift" style={{ animationDuration: '13s', animationDelay: '2s' }}>
          <g transform="rotate(5 1400 250)">
            <rect x="1350" y="190" width="100" height="120" rx="8" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-dim)" strokeWidth="1" />
            <text x="1400" y="235" textAnchor="middle" fill="var(--svg-text-faint)" fontSize="28">?</text>
            <circle cx="1375" cy="270" r="5" fill="rgba(34,211,238,0.2)" stroke="rgba(34,211,238,0.3)" strokeWidth="1" />
            <line x1="1388" y1="270" x2="1430" y2="270" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <circle cx="1375" cy="290" r="5" fill="none" stroke="var(--svg-stroke-subtle)" strokeWidth="1" />
            <line x1="1388" y1="290" x2="1425" y2="290" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          </g>
        </g>

        {/* Card 5 — bottom-right */}
        <g className="svg-drift" style={{ animationDuration: '15s', animationDelay: '8s' }}>
          <g transform="rotate(12 1350 750)">
            <rect x="1300" y="690" width="100" height="120" rx="8" fill="var(--svg-fill-dim)" stroke="var(--svg-stroke-dim)" strokeWidth="1" />
            <rect x="1320" y="710" width="60" height="8" rx="4" fill="rgba(255,255,255,0.06)" />
            <rect x="1320" y="728" width="50" height="8" rx="4" fill="var(--svg-fill-dim)" />
            <rect x="1320" y="746" width="55" height="8" rx="4" fill="rgba(255,255,255,0.05)" />
            <rect x="1320" y="770" width="60" height="14" rx="7" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}
