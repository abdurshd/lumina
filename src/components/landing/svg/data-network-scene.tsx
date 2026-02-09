'use client';

export function DataNetworkScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#111111] to-[#0d0d0d] opacity-90" />

      <svg
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="data-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="data-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Central radial glow */}
          <radialGradient id="data-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.03)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>

          {/* Line gradient */}
          <linearGradient id="data-line-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0" stopColor="rgba(34,211,238,0.05)" />
            <stop offset="0.5" stopColor="rgba(34,211,238,0.4)" />
            <stop offset="1" stopColor="rgba(34,211,238,0.05)" />
          </linearGradient>

          {/* Hexagonal grid pattern */}
          <pattern id="data-hex-grid" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
            <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background hex grid */}
        <rect width="100%" height="100%" fill="url(#data-hex-grid)" />

        {/* Central radial glow */}
        <circle cx="960" cy="540" r="450" fill="url(#data-center-glow)" />

        {/* Background star particles */}
        <circle cx="120" cy="100" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '0s' }} />
        <circle cx="300" cy="180" r="1.5" fill="#fff" className="svg-twinkle" style={{ animationDelay: '0.5s' }} />
        <circle cx="500" cy="80" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '1.2s' }} />
        <circle cx="700" cy="150" r="1.5" fill="#fff" className="svg-twinkle" style={{ animationDelay: '0.8s' }} />
        <circle cx="1200" cy="100" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '1.5s' }} />
        <circle cx="1500" cy="160" r="1.5" fill="#fff" className="svg-twinkle" style={{ animationDelay: '0.3s' }} />
        <circle cx="1800" cy="120" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '2.0s' }} />
        <circle cx="150" cy="900" r="1.5" fill="#fff" className="svg-twinkle" style={{ animationDelay: '1.0s' }} />
        <circle cx="400" cy="980" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '0.7s' }} />
        <circle cx="700" cy="950" r="1.5" fill="#fff" className="svg-twinkle" style={{ animationDelay: '1.8s' }} />
        <circle cx="1200" cy="980" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '0.2s' }} />
        <circle cx="1550" cy="920" r="1.5" fill="#fff" className="svg-twinkle" style={{ animationDelay: '1.3s' }} />
        <circle cx="1800" cy="960" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '2.2s' }} />
        <circle cx="80" cy="540" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '0.6s' }} />
        <circle cx="1860" cy="540" r="1" fill="#fff" className="svg-twinkle" style={{ animationDelay: '1.6s' }} />

        {/* --- Primary connections: center ↔ outer nodes --- */}
        <g stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="5 5" className="svg-dash-flow">
          <line x1="960" y1="540" x2="960" y2="200" />
          <line x1="960" y1="540" x2="400" y2="540" />
          <line x1="960" y1="540" x2="1520" y2="540" />
          <line x1="960" y1="540" x2="960" y2="880" />
        </g>

        {/* --- Cross-connections between outer nodes --- */}
        <g stroke="rgba(34,211,238,0.08)" strokeWidth="0.5" strokeDasharray="3 8" className="svg-dash-flow" style={{ animationDuration: '30s' }}>
          <line x1="960" y1="200" x2="400" y2="540" />
          <line x1="960" y1="200" x2="1520" y2="540" />
          <line x1="400" y1="540" x2="960" y2="880" />
          <line x1="1520" y1="540" x2="960" y2="880" />
          <line x1="400" y1="540" x2="1520" y2="540" />
          <line x1="960" y1="200" x2="960" y2="880" />
        </g>

        {/* --- Inner ring of secondary nodes (6 sub-data-types) --- */}
        <g stroke="rgba(34,211,238,0.15)" strokeWidth="0.5" strokeDasharray="3 6" className="svg-dash-flow" style={{ animationDuration: '25s' }}>
          <line x1="960" y1="540" x2="760" y2="370" />
          <line x1="960" y1="540" x2="1160" y2="370" />
          <line x1="960" y1="540" x2="720" y2="600" />
          <line x1="960" y1="540" x2="1200" y2="600" />
          <line x1="960" y1="540" x2="820" y2="740" />
          <line x1="960" y1="540" x2="1100" y2="740" />
        </g>

        {/* Secondary inner nodes */}
        <circle cx="760" cy="370" r="14" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" className="svg-pulse-node" style={{ animationDelay: '0.5s' }} />
        <circle cx="1160" cy="370" r="14" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" className="svg-pulse-node" style={{ animationDelay: '1.0s' }} />
        <circle cx="720" cy="600" r="12" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" className="svg-pulse-node" style={{ animationDelay: '1.5s' }} />
        <circle cx="1200" cy="600" r="12" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" className="svg-pulse-node" style={{ animationDelay: '2.0s' }} />
        <circle cx="820" cy="740" r="14" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" className="svg-pulse-node" style={{ animationDelay: '0.8s' }} />
        <circle cx="1100" cy="740" r="14" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" className="svg-pulse-node" style={{ animationDelay: '1.3s' }} />

        {/* Small labels for secondary nodes */}
        <text x="760" y="374" textAnchor="middle" fill="rgba(34,211,238,0.5)" fontSize="8" fontFamily="monospace">docs</text>
        <text x="1160" y="374" textAnchor="middle" fill="rgba(34,211,238,0.5)" fontSize="8" fontFamily="monospace">tasks</text>
        <text x="720" y="604" textAnchor="middle" fill="rgba(34,211,238,0.5)" fontSize="8" fontFamily="monospace">cal</text>
        <text x="1200" y="604" textAnchor="middle" fill="rgba(34,211,238,0.5)" fontSize="8" fontFamily="monospace">notes</text>
        <text x="820" y="744" textAnchor="middle" fill="rgba(34,211,238,0.5)" fontSize="8" fontFamily="monospace">chat</text>
        <text x="1100" y="744" textAnchor="middle" fill="rgba(34,211,238,0.5)" fontSize="8" fontFamily="monospace">files</text>

        {/* --- Animated data particles traveling along paths --- */}
        {/* Particle 1: center → top */}
        <circle r="4" fill="#22d3ee" filter="url(#data-glow)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M960,540 L960,200" />
        </circle>
        {/* Particle 2: left → center */}
        <circle r="4" fill="#22d3ee" filter="url(#data-glow)">
          <animateMotion dur="4s" repeatCount="indefinite" path="M400,540 L960,540" />
        </circle>
        {/* Particle 3: center → right */}
        <circle r="3" fill="#a78bfa" filter="url(#data-glow)">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M960,540 L1520,540" />
        </circle>
        {/* Particle 4: bottom → center */}
        <circle r="4" fill="#10a37f" filter="url(#data-glow)">
          <animateMotion dur="4.5s" repeatCount="indefinite" path="M960,880 L960,540" />
        </circle>
        {/* Particle 5: cross diagonal top-left */}
        <circle r="3" fill="#f97316" filter="url(#data-glow)" opacity="0.7">
          <animateMotion dur="5s" repeatCount="indefinite" path="M960,200 L400,540" />
        </circle>
        {/* Particle 6: cross diagonal top-right */}
        <circle r="3" fill="#22d3ee" filter="url(#data-glow)" opacity="0.7">
          <animateMotion dur="5.5s" repeatCount="indefinite" path="M1520,540 L960,200" />
        </circle>
        {/* Particle 7: inner ring */}
        <circle r="2" fill="#22d3ee" filter="url(#data-glow)" opacity="0.6">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M960,540 L760,370" />
        </circle>
        {/* Particle 8: inner ring */}
        <circle r="2" fill="#22d3ee" filter="url(#data-glow)" opacity="0.6">
          <animateMotion dur="3s" repeatCount="indefinite" path="M960,540 L1100,740" />
        </circle>

        {/* --- Pulsing concentric circles around AI node --- */}
        <circle cx="960" cy="540" r="90" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1" className="svg-pulse-ring" />
        <circle cx="960" cy="540" r="90" fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="1" className="svg-pulse-ring" style={{ animationDelay: '1s' }} />
        <circle cx="960" cy="540" r="90" fill="none" stroke="rgba(34,211,238,0.05)" strokeWidth="1" className="svg-pulse-ring" style={{ animationDelay: '2s' }} />

        {/* --- Center Node (Lumina AI) --- */}
        <g transform="translate(960, 540)">
          <circle r="80" fill="rgba(34,211,238,0.03)" stroke="rgba(34,211,238,0.2)" strokeWidth="2" />
          <circle r="50" fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
          <circle r="25" fill="rgba(34,211,238,0.1)" />
          <text x="0" y="6" textAnchor="middle" fill="#22d3ee" fontSize="20" fontFamily="monospace" opacity="0.9">AI</text>
        </g>

        {/* --- Outer Node: Top (Gmail) --- */}
        <g transform="translate(960, 200)" className="svg-float" style={{ animationDuration: '6s' }}>
          <circle r="45" fill="#1b1b1b" stroke="#f97316" strokeWidth="2" filter="url(#data-glow)" />
          <circle r="45" fill="rgba(249,115,22,0.05)" />
          {/* Mail icon */}
          <rect x="-16" y="-11" width="32" height="22" rx="3" fill="none" stroke="#f97316" strokeWidth="1.5" />
          <path d="M-16 -11 L0 3 L16 -11" fill="none" stroke="#f97316" strokeWidth="1.5" />
          <text x="0" y="30" textAnchor="middle" fill="rgba(249,115,22,0.6)" fontSize="10" fontFamily="monospace">Gmail</text>
        </g>

        {/* --- Outer Node: Left (Drive) --- */}
        <g transform="translate(400, 540)" className="svg-float" style={{ animationDuration: '7s', animationDelay: '1s' }}>
          <circle r="45" fill="#1b1b1b" stroke="#22d3ee" strokeWidth="2" filter="url(#data-glow)" />
          <circle r="45" fill="rgba(34,211,238,0.05)" />
          {/* Drive triangle icon */}
          <path d="M-12 12 L0 -12 L12 12 Z" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
          <line x1="-12" y1="12" x2="12" y2="12" stroke="#22d3ee" strokeWidth="1.5" />
          <text x="0" y="30" textAnchor="middle" fill="rgba(34,211,238,0.6)" fontSize="10" fontFamily="monospace">Drive</text>
        </g>

        {/* --- Outer Node: Right (Notion) --- */}
        <g transform="translate(1520, 540)" className="svg-float" style={{ animationDuration: '6.5s', animationDelay: '2s' }}>
          <circle r="45" fill="#1b1b1b" stroke="#a78bfa" strokeWidth="2" filter="url(#data-glow)" />
          <circle r="45" fill="rgba(167,139,250,0.05)" />
          {/* N icon */}
          <text x="0" y="8" textAnchor="middle" fill="#a78bfa" fontSize="22" fontWeight="bold" fontFamily="serif">N</text>
          <text x="0" y="30" textAnchor="middle" fill="rgba(167,139,250,0.6)" fontSize="10" fontFamily="monospace">Notion</text>
        </g>

        {/* --- Outer Node: Bottom (ChatGPT) --- */}
        <g transform="translate(960, 880)" className="svg-float" style={{ animationDuration: '7.5s', animationDelay: '3s' }}>
          <circle r="45" fill="#1b1b1b" stroke="#10a37f" strokeWidth="2" filter="url(#data-glow)" />
          <circle r="45" fill="rgba(16,163,127,0.05)" />
          {/* Spiral icon */}
          <circle r="12" fill="none" stroke="#10a37f" strokeWidth="1.5" />
          <circle r="6" fill="none" stroke="#10a37f" strokeWidth="1" strokeDasharray="3 2" />
          <text x="0" y="30" textAnchor="middle" fill="rgba(16,163,127,0.6)" fontSize="10" fontFamily="monospace">ChatGPT</text>
        </g>
      </svg>
    </div>
  );
}
