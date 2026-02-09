'use client';

export function ReportConstellationScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <svg
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="report-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="report-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
            <stop offset="60%" stopColor="rgba(34,211,238,0.02)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
        </defs>

        {/* Background radial glow */}
        <circle cx="960" cy="540" r="480" fill="url(#report-center-glow)" />

        {/* === Constellation Radar at center, scale 3x === */}
        <g transform="translate(960, 540) scale(3)">

          {/* 3 Nested hexagonal grid rings */}
          <polygon points="0,-100 86,-50 86,50 0,100 -86,50 -86,-50"
            fill="none" stroke="var(--svg-stroke-subtle)" strokeWidth="0.8" />
          <polygon points="0,-66 57,-33 57,33 0,66 -57,33 -57,-33"
            fill="none" stroke="var(--svg-stroke-dim)" strokeWidth="0.6" />
          <polygon points="0,-33 29,-16 29,16 0,33 -29,16 -29,-16"
            fill="none" stroke="var(--svg-stroke-faint)" strokeWidth="0.5" />

          {/* 6 Axis lines radiating from center with glow */}
          <g stroke="rgba(34,211,238,0.15)" strokeWidth="0.5">
            <line x1="0" y1="0" x2="0" y2="-105" />
            <line x1="0" y1="0" x2="91" y2="-52" />
            <line x1="0" y1="0" x2="91" y2="52" />
            <line x1="0" y1="0" x2="0" y2="105" />
            <line x1="0" y1="0" x2="-91" y2="52" />
            <line x1="0" y1="0" x2="-91" y2="-52" />
          </g>

          {/* Dimension labels at each vertex */}
          <text x="0" y="-108" textAnchor="middle" fill="rgba(34,211,238,0.6)" fontSize="6" fontFamily="monospace">Creative</text>
          <text x="96" y="-50" textAnchor="start" fill="rgba(34,211,238,0.6)" fontSize="6" fontFamily="monospace">Analytical</text>
          <text x="96" y="55" textAnchor="start" fill="rgba(34,211,238,0.6)" fontSize="6" fontFamily="monospace">Social</text>
          <text x="0" y="115" textAnchor="middle" fill="rgba(34,211,238,0.6)" fontSize="6" fontFamily="monospace">Enterprising</text>
          <text x="-96" y="55" textAnchor="end" fill="rgba(34,211,238,0.6)" fontSize="6" fontFamily="monospace">Conventional</text>
          <text x="-96" y="-50" textAnchor="end" fill="rgba(34,211,238,0.6)" fontSize="6" fontFamily="monospace">Realistic</text>

          {/* Data shape polygon — draws in via animation */}
          <polygon
            points="0,-80 70,-25 55,45 0,85 -45,35 -65,-30"
            fill="rgba(34,211,238,0.08)"
            stroke="#22d3ee"
            strokeWidth="1.5"
            filter="url(#report-glow)"
            className="svg-draw-shape"
          />

          {/* Vertex stars on data shape — twinkling */}
          <circle cx="0" cy="-80" r="2.5" fill="var(--svg-dot)" className="svg-twinkle" filter="url(#report-glow)" style={{ animationDelay: '0s' }} />
          <circle cx="70" cy="-25" r="2.5" fill="var(--svg-dot)" className="svg-twinkle" filter="url(#report-glow)" style={{ animationDelay: '0.3s' }} />
          <circle cx="55" cy="45" r="2.5" fill="var(--svg-dot)" className="svg-twinkle" filter="url(#report-glow)" style={{ animationDelay: '0.6s' }} />
          <circle cx="0" cy="85" r="2.5" fill="var(--svg-dot)" className="svg-twinkle" filter="url(#report-glow)" style={{ animationDelay: '0.9s' }} />
          <circle cx="-45" cy="35" r="2.5" fill="var(--svg-dot)" className="svg-twinkle" filter="url(#report-glow)" style={{ animationDelay: '1.2s' }} />
          <circle cx="-65" cy="-30" r="2.5" fill="var(--svg-dot)" className="svg-twinkle" filter="url(#report-glow)" style={{ animationDelay: '1.5s' }} />
        </g>

        {/* === Constellation star-map dots connected by thin lines (20+) === */}
        <g stroke="var(--svg-stroke-dim)" strokeWidth="0.5" fill="none">
          {/* Upper-left cluster */}
          <line x1="180" y1="160" x2="280" y2="200" />
          <line x1="280" y1="200" x2="320" y2="140" />
          <line x1="320" y1="140" x2="420" y2="180" />
          <line x1="180" y1="160" x2="250" y2="280" />
          <line x1="250" y1="280" x2="350" y2="300" />

          {/* Upper-right cluster */}
          <line x1="1500" y1="120" x2="1600" y2="180" />
          <line x1="1600" y1="180" x2="1650" y2="130" />
          <line x1="1650" y1="130" x2="1750" y2="170" />
          <line x1="1600" y1="180" x2="1580" y2="260" />

          {/* Lower-left cluster */}
          <line x1="200" y1="800" x2="300" y2="850" />
          <line x1="300" y1="850" x2="280" y2="930" />
          <line x1="280" y1="930" x2="380" y2="900" />
          <line x1="200" y1="800" x2="150" y2="880" />

          {/* Lower-right cluster */}
          <line x1="1600" y1="800" x2="1700" y2="830" />
          <line x1="1700" y1="830" x2="1680" y2="920" />
          <line x1="1680" y1="920" x2="1780" y2="880" />
          <line x1="1600" y1="800" x2="1550" y2="900" />
        </g>

        {/* Constellation dots */}
        <g>
          {/* Upper-left */}
          <circle cx="180" cy="160" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.2s' }} />
          <circle cx="280" cy="200" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.8s' }} />
          <circle cx="320" cy="140" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.4s' }} />
          <circle cx="420" cy="180" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.5s' }} />
          <circle cx="250" cy="280" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.0s' }} />
          <circle cx="350" cy="300" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.1s' }} />

          {/* Upper-right */}
          <circle cx="1500" cy="120" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.3s' }} />
          <circle cx="1600" cy="180" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.6s' }} />
          <circle cx="1650" cy="130" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.9s' }} />
          <circle cx="1750" cy="170" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.2s' }} />
          <circle cx="1580" cy="260" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.6s' }} />

          {/* Lower-left */}
          <circle cx="200" cy="800" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.3s' }} />
          <circle cx="300" cy="850" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.1s' }} />
          <circle cx="280" cy="930" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.8s' }} />
          <circle cx="380" cy="900" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.7s' }} />
          <circle cx="150" cy="880" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.4s' }} />

          {/* Lower-right */}
          <circle cx="1600" cy="800" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.4s' }} />
          <circle cx="1700" cy="830" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.7s' }} />
          <circle cx="1680" cy="920" r="2" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.0s' }} />
          <circle cx="1780" cy="880" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.1s' }} />
          <circle cx="1550" cy="900" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.5s' }} />

          {/* Scattered solo stars */}
          <circle cx="100" cy="500" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '1.5s' }} />
          <circle cx="1850" cy="500" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.8s' }} />
          <circle cx="500" cy="50" r="1.5" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '2.3s' }} />
          <circle cx="1400" cy="1020" r="1" fill="var(--svg-dot)" className="svg-twinkle" style={{ animationDelay: '0.2s' }} />
        </g>

        {/* Decorative: small crosses (+) at random positions */}
        <g stroke="var(--svg-stroke-dim)" strokeWidth="0.5">
          <line x1="140" y1="340" x2="140" y2="350" /><line x1="135" y1="345" x2="145" y2="345" />
          <line x1="1780" y1="300" x2="1780" y2="310" /><line x1="1775" y1="305" x2="1785" y2="305" />
          <line x1="350" y1="700" x2="350" y2="710" /><line x1="345" y1="705" x2="355" y2="705" />
          <line x1="1600" y1="650" x2="1600" y2="660" /><line x1="1595" y1="655" x2="1605" y2="655" />
          <line x1="500" y1="450" x2="500" y2="460" /><line x1="495" y1="455" x2="505" y2="455" />
          <line x1="1400" y1="400" x2="1400" y2="410" /><line x1="1395" y1="405" x2="1405" y2="405" />
          <line x1="250" y1="550" x2="250" y2="560" /><line x1="245" y1="555" x2="255" y2="555" />
          <line x1="1700" y1="500" x2="1700" y2="510" /><line x1="1695" y1="505" x2="1705" y2="505" />
        </g>
      </svg>
    </div>
  );
}
