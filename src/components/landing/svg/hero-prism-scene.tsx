'use client';

export function HeroPrismScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background opacity-80" />

      <svg
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Prism glass gradient */}
          <linearGradient id="hero-prism-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>

          {/* Grid pattern */}
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="0.5" />
          </pattern>

          {/* Glow filters */}
          <filter id="hero-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hero-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hero-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial glow behind prism */}
          <radialGradient id="hero-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.06)" />
            <stop offset="60%" stopColor="rgba(34,211,238,0.02)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
        </defs>

        {/* L1: Background Grid */}
        <rect width="100%" height="100%" fill="url(#hero-grid)" />

        {/* L2: Center radial glow */}
        <circle cx="960" cy="540" r="500" fill="url(#hero-center-glow)" />

        {/* L8: Geometric decorative patterns — hexagons, circles, connecting lines */}
        <g opacity="0.04" stroke="var(--foreground)" strokeWidth="0.5" fill="none">
          {/* Hexagon top-left */}
          <polygon points="300,200 340,180 380,200 380,240 340,260 300,240" className="svg-draw-path" style={{ animationDelay: '0.5s' }} />
          {/* Hexagon bottom-right */}
          <polygon points="1540,780 1580,760 1620,780 1620,820 1580,840 1540,820" className="svg-draw-path" style={{ animationDelay: '1s' }} />
          {/* Circle cluster */}
          <circle cx="1680" cy="200" r="30" className="svg-draw-path" style={{ animationDelay: '1.5s' }} />
          <circle cx="1720" cy="230" r="20" className="svg-draw-path" style={{ animationDelay: '2s' }} />
          {/* Connecting lines */}
          <line x1="200" y1="400" x2="350" y2="350" className="svg-draw-path" style={{ animationDelay: '0.8s' }} />
          <line x1="1600" y1="400" x2="1750" y2="350" className="svg-draw-path" style={{ animationDelay: '1.2s' }} />
          {/* More hexagons */}
          <polygon points="150,650 190,630 230,650 230,690 190,710 150,690" className="svg-draw-path" style={{ animationDelay: '1.8s' }} />
          <polygon points="1700,550 1740,530 1780,550 1780,590 1740,610 1700,590" className="svg-draw-path" style={{ animationDelay: '2.2s' }} />
        </g>
        <g opacity="0.06" stroke="var(--foreground)" strokeWidth="0.5" fill="none">
          <line x1="340" y1="260" x2="200" y2="400" />
          <line x1="1580" y1="840" x2="1700" y2="590" />
          <line x1="1680" y1="200" x2="1750" y2="350" />
          <circle cx="240" cy="870" r="25" className="svg-draw-path" style={{ animationDelay: '2.5s' }} />
          <circle cx="1650" cy="900" r="18" className="svg-draw-path" style={{ animationDelay: '2.8s' }} />
        </g>

        {/* L3-L6: Central Prism Group */}
        <g transform="translate(960, 540) scale(1.5)">

          {/* L4: Input Beam — dashed white line from left */}
          <path
            d="M-800 0 L-100 0"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="10 20"
            className="svg-beam-flow"
            opacity="0.5"
          />
          {/* Secondary faint beam */}
          <path
            d="M-800 -5 L-100 -5"
            stroke="white"
            strokeWidth="0.5"
            strokeDasharray="4 12"
            className="svg-beam-flow"
            opacity="0.2"
            style={{ animationDelay: '0.5s' }}
          />

          {/* L3: The Prism Triangle with glass fill */}
          <path
            d="M-70 -90 L70 0 L-70 90 Z"
            fill="url(#hero-prism-grad)"
            stroke="var(--svg-stroke-subtle)"
            strokeWidth="1.5"
          />
          {/* Inner prism highlight edge */}
          <path
            d="M-65 -80 L60 0 L-65 80"
            fill="none"
            stroke="var(--svg-stroke-dim)"
            strokeWidth="0.5"
          />

          {/* L5: Refracted Ray 1 — Orange upward */}
          <g filter="url(#hero-glow)">
            <path
              d="M0 -10 C 80 -30, 200 -120, 500 -250 Q 600 -300, 750 -320"
              stroke="#f97316"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 12"
              className="svg-ray-flow"
            />
            {/* Glow shadow ray */}
            <path
              d="M0 -10 C 80 -30, 200 -120, 500 -250 Q 600 -300, 750 -320"
              stroke="#f97316"
              strokeWidth="8"
              fill="none"
              opacity="0.15"
              filter="url(#hero-glow-soft)"
            />
          </g>

          {/* L5: Refracted Ray 2 — Cyan straight */}
          <g filter="url(#hero-glow)">
            <path
              d="M0 0 C 100 5, 250 -10, 500 15 Q 650 20, 850 0"
              stroke="#22d3ee"
              strokeWidth="4"
              fill="none"
              strokeDasharray="6 10"
              className="svg-ray-flow"
              style={{ animationDelay: '0.3s', animationDuration: '2.5s' }}
            />
            <path
              d="M0 0 C 100 5, 250 -10, 500 15 Q 650 20, 850 0"
              stroke="#22d3ee"
              strokeWidth="10"
              fill="none"
              opacity="0.12"
              filter="url(#hero-glow-soft)"
            />
          </g>

          {/* L5: Refracted Ray 3 — Purple downward */}
          <g filter="url(#hero-glow)">
            <path
              d="M0 10 C 80 30, 200 150, 500 280 Q 600 330, 750 360"
              stroke="#a78bfa"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10 14"
              className="svg-ray-flow"
              style={{ animationDelay: '0.6s', animationDuration: '3.5s' }}
            />
            <path
              d="M0 10 C 80 30, 200 150, 500 280 Q 600 330, 750 360"
              stroke="#a78bfa"
              strokeWidth="8"
              fill="none"
              opacity="0.15"
              filter="url(#hero-glow-soft)"
            />
          </g>

          {/* L6: Talent nodes along orange ray */}
          <circle cx="200" cy="-80" r="3" fill="#f97316" className="svg-pulse-node" style={{ animationDelay: '0s' }} />
          <circle cx="400" cy="-180" r="4" fill="#f97316" className="svg-pulse-node" style={{ animationDelay: '0.4s' }} />
          <circle cx="600" cy="-270" r="3" fill="#f97316" className="svg-pulse-node" style={{ animationDelay: '0.8s' }} />
          <circle cx="750" cy="-320" r="5" fill="#f97316" className="svg-pulse-node" style={{ animationDelay: '1.2s' }} filter="url(#hero-glow)" />

          {/* L6: Talent nodes along cyan ray */}
          <circle cx="200" cy="0" r="4" fill="#22d3ee" className="svg-pulse-node" style={{ animationDelay: '0.2s' }} />
          <circle cx="450" cy="10" r="3" fill="#22d3ee" className="svg-pulse-node" style={{ animationDelay: '0.6s' }} />
          <circle cx="650" cy="15" r="4" fill="#22d3ee" className="svg-pulse-node" style={{ animationDelay: '1.0s' }} />
          <circle cx="850" cy="0" r="5" fill="#22d3ee" className="svg-pulse-node" style={{ animationDelay: '1.4s' }} filter="url(#hero-glow)" />

          {/* L6: Talent nodes along purple ray */}
          <circle cx="200" cy="100" r="3" fill="#a78bfa" className="svg-pulse-node" style={{ animationDelay: '0.1s' }} />
          <circle cx="400" cy="200" r="4" fill="#a78bfa" className="svg-pulse-node" style={{ animationDelay: '0.5s' }} />
          <circle cx="600" cy="300" r="3" fill="#a78bfa" className="svg-pulse-node" style={{ animationDelay: '0.9s' }} />
          <circle cx="750" cy="360" r="5" fill="#a78bfa" className="svg-pulse-node" style={{ animationDelay: '1.3s' }} filter="url(#hero-glow)" />
        </g>

        {/* L7: Scattered star particles (30+) with individual twinkle delays */}
        <g>
          <circle cx="120" cy="80" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0s' }} />
          <circle cx="250" cy="150" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.3s' }} />
          <circle cx="380" cy="90" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.7s' }} />
          <circle cx="500" cy="200" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.1s' }} />
          <circle cx="650" cy="120" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.5s' }} />
          <circle cx="100" cy="400" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.4s' }} />
          <circle cx="200" cy="700" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.0s' }} />
          <circle cx="350" cy="950" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.9s' }} />
          <circle cx="500" cy="850" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.7s' }} />
          <circle cx="700" cy="980" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.3s' }} />
          <circle cx="800" cy="100" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.2s' }} />
          <circle cx="1050" cy="60" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.5s' }} />
          <circle cx="1150" cy="150" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.8s' }} />
          <circle cx="1300" cy="80" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.1s' }} />
          <circle cx="1450" cy="180" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.4s' }} />
          <circle cx="1600" cy="100" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.9s' }} />
          <circle cx="1750" cy="150" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.6s' }} />
          <circle cx="1850" cy="250" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.5s' }} />
          <circle cx="1800" cy="500" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.2s' }} />
          <circle cx="1880" cy="700" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.1s' }} />
          <circle cx="1750" cy="850" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.8s' }} />
          <circle cx="1600" cy="950" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.4s' }} />
          <circle cx="1400" cy="980" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.3s' }} />
          <circle cx="1200" cy="950" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.6s' }} />
          <circle cx="1000" cy="1000" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.2s' }} />
          <circle cx="900" cy="950" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.7s' }} />
          <circle cx="60" cy="540" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.3s' }} />
          <circle cx="80" cy="900" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.6s' }} />
          <circle cx="1900" cy="400" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.9s' }} />
          <circle cx="1850" cy="950" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.1s' }} />
          <circle cx="960" cy="50" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.0s' }} />
          <circle cx="960" cy="1030" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.5s' }} />
        </g>

        {/* L9: Floating abstract shapes that drift slowly */}
        <g className="svg-drift" style={{ animationDuration: '18s' }}>
          {/* Small triangle */}
          <polygon points="180,300 195,275 210,300" fill="none" stroke="var(--svg-stroke-dim)" strokeWidth="0.5" />
          {/* Small circle */}
          <circle cx="1750" cy="450" r="8" fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="0.5" />
          {/* Small square */}
          <rect x="140" y="650" width="15" height="15" fill="none" stroke="var(--svg-stroke-dim)" strokeWidth="0.5" transform="rotate(20 147 657)" />
        </g>
        <g className="svg-drift" style={{ animationDuration: '22s', animationDelay: '5s' }}>
          <polygon points="1700,700 1715,675 1730,700" fill="none" stroke="var(--svg-stroke-dim)" strokeWidth="0.5" />
          <circle cx="300" cy="500" r="6" fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="0.5" />
          <rect x="1600" y="250" width="12" height="12" fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="0.5" transform="rotate(45 1606 256)" />
        </g>
        <g className="svg-drift" style={{ animationDuration: '25s', animationDelay: '10s' }}>
          <polygon points="500,600 515,575 530,600" fill="none" stroke="var(--svg-stroke-dim)" strokeWidth="0.5" />
          <circle cx="1400" cy="150" r="10" fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="0.5" />
          <rect x="800" y="900" width="10" height="10" fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="0.5" transform="rotate(30 805 905)" />
        </g>
      </svg>
    </div>
  );
}
