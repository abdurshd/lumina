'use client';



export function HeroPrismScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#111111] to-[#0d0d0d] opacity-80" />

      <svg
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="prism-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Floating Shapes */}
        <g className="animate-float-slow">
          <circle cx="200" cy="200" r="2" fill="rgba(255,255,255,0.2)" />
          <circle cx="1700" cy="300" r="3" fill="rgba(255,255,255,0.15)" />
          <circle cx="1000" cy="900" r="2" fill="rgba(255,255,255,0.1)" />
        </g>

        {/* Central Prism Group */}
        <g transform="translate(960, 540) scale(1.5)">

          {/* Input Beam */}
          <path
            d="M-800 0 L-100 0"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="10 20"
            className="animate-beam-flow"
            style={{ opacity: 0.6 }}
          />

          {/* The Prism Triangle */}
          <path
            d="M-60 -80 L60 0 L-60 80 Z"
            fill="url(#prism-gradient)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          {/* Refracted Rays */}
          {/* Ray 1: Orange - Upwards */}
          <g filter="url(#glow)">
            <path
              d="M0 0 C 100 0, 150 -100, 800 -300"
              stroke="#f97316"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5 10"
              className="animate-ray-flow-1"
            />
            <circle cx="800" cy="-300" r="4" fill="#f97316" className="animate-pulse-slow" />
          </g>

          {/* Ray 2: Cyan - Straight */}
          <g filter="url(#glow)">
            <path
              d="M0 0 C 120 0, 200 0, 900 0"
              stroke="#22d3ee"
              strokeWidth="4"
              fill="none"
              strokeDasharray="4 8"
              className="animate-ray-flow-2"
            />
            <circle cx="900" cy="0" r="5" fill="#22d3ee" className="animate-pulse-medium" />
          </g>

          {/* Ray 3: Purple - Downwards */}
          <g filter="url(#glow)">
            <path
              d="M0 0 C 100 0, 150 100, 800 350"
              stroke="#a78bfa"
              strokeWidth="3"
              fill="none"
              strokeDasharray="6 12"
              className="animate-ray-flow-3"
            />
            <circle cx="800" cy="350" r="4" fill="#a78bfa" className="animate-pulse-fast" />
          </g>
        </g>

        {/* Decorative Particles along the rays */}
        <circle cx="1100" cy="400" r="3" fill="#f97316" opacity="0.6" className="animate-ping-slow" />
        <circle cx="1300" cy="540" r="4" fill="#22d3ee" opacity="0.7" className="animate-ping-medium" />
        <circle cx="1200" cy="700" r="3" fill="#a78bfa" opacity="0.6" className="animate-ping-fast" />

      </svg>

      <style jsx global>{`
        @keyframes beam-flow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes ray-flow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .animate-beam-flow {
          animation: beam-flow 2s linear infinite;
        }
        .animate-ray-flow-1 {
          animation: ray-flow 3s linear infinite;
        }
        .animate-ray-flow-2 {
          animation: ray-flow 2.5s linear infinite;
        }
        .animate-ray-flow-3 {
          animation: ray-flow 3.5s linear infinite;
        }
        .animate-float-slow {
          animation: float 20s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-medium {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-fast {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-ping-slow {
           animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-medium {
           animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-fast {
           animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
