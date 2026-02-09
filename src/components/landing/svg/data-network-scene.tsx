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
                    <filter id="data-glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <linearGradient id="line-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
                        <stop offset="0" stopColor="rgba(34, 211, 238, 0.1)" />
                        <stop offset="0.5" stopColor="rgba(34, 211, 238, 0.5)" />
                        <stop offset="1" stopColor="rgba(34, 211, 238, 0.1)" />
                    </linearGradient>
                </defs>

                {/* --- Connections Network --- */}
                <g stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="5 5">
                    {/* Center to Top (Gmail) */}
                    <line x1="960" y1="540" x2="960" y2="200" className="animate-dash" />
                    {/* Center to Left (Drive) */}
                    <line x1="960" y1="540" x2="400" y2="540" className="animate-dash-slow" />
                    {/* Center to Right (Notion) */}
                    <line x1="960" y1="540" x2="1520" y2="540" className="animate-dash-slow" />
                    {/* Center to Bottom (ChatGPT) */}
                    <line x1="960" y1="540" x2="960" y2="880" className="animate-dash" />
                </g>

                {/* --- Moving Particles on Lines --- */}
                {/* Particle 1 */}
                <circle r="4" fill="#22d3ee" filter="url(#data-glow)">
                    <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M960 540 L960 200"
                    />
                </circle>
                {/* Particle 2 */}
                <circle r="4" fill="#22d3ee" filter="url(#data-glow)">
                    <animateMotion
                        dur="4s"
                        repeatCount="indefinite"
                        path="M400 540 L960 540"
                    />
                </circle>

                {/* --- Nodes --- */}
                {/* Center Node (Lumina Brain) */}
                <g transform="translate(960, 540)" className="animate-pulse-slow">
                    <circle r="80" fill="rgba(34, 211, 238, 0.05)" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="2" />
                    <circle r="50" fill="rgba(34, 211, 238, 0.1)" />
                    <text x="0" y="5" textAnchor="middle" fill="#22d3ee" fontSize="24" fontFamily="monospace" style={{ opacity: 0.8 }}>AI</text>
                </g>

                {/* Top Node (Gmail) */}
                <g transform="translate(960, 200)" className="animate-float">
                    <circle r="40" fill="#1b1b1b" stroke="#f97316" strokeWidth="2" filter="url(#data-glow)" />
                    {/* Approximate Mail Icon Path */}
                    <path d="M-15 -10 L15 -10 L15 10 L-15 10 Z" fill="none" stroke="#f97316" strokeWidth="2" />
                    <path d="M-15 -10 L0 0 L15 -10" fill="none" stroke="#f97316" strokeWidth="2" />
                </g>

                {/* Left Node (Drive) */}
                <g transform="translate(400, 540)" className="animate-float-delayed">
                    <circle r="40" fill="#1b1b1b" stroke="#22d3ee" strokeWidth="2" filter="url(#data-glow)" />
                    {/* Drive Triangle */}
                    <path d="M-10 10 L0 -10 L10 10" fill="none" stroke="#22d3ee" strokeWidth="2" />
                </g>

                {/* Right Node (Notion) */}
                <g transform="translate(1520, 540)" className="animate-float">
                    <circle r="40" fill="#1b1b1b" stroke="#a78bfa" strokeWidth="2" filter="url(#data-glow)" />
                    {/* Approx N icon */}
                    <text x="0" y="8" textAnchor="middle" fill="#a78bfa" fontSize="24" fontWeight="bold">N</text>
                </g>

                {/* Bottom Node (ChatGPT) */}
                <g transform="translate(960, 880)" className="animate-float-delayed">
                    <circle r="40" fill="#1b1b1b" stroke="#10a37f" strokeWidth="2" filter="url(#data-glow)" />
                    {/* Spiral-ish icon */}
                    <circle r="15" fill="none" stroke="#10a37f" strokeWidth="2" strokeDasharray="4 2" />
                </g>

                <style jsx>{`
          .animate-dash {
            animation: dash 20s linear infinite;
          }
          .animate-dash-slow {
            animation: dash 30s linear infinite;
          }
          .animate-pulse-slow {
            animation: pulse 4s ease-in-out infinite;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float 6s ease-in-out infinite;
            animation-delay: 3s;
          }

          @keyframes dash {
            to { stroke-dashoffset: -1000; }
          }
          @keyframes pulse {
            0%, 100% { transform: translate(960px, 540px) scale(1); opacity: 0.8; }
            50% { transform: translate(960px, 540px) scale(1.05); opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
            </svg>
        </div>
    );
}
