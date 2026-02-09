'use client';

export function SessionScene() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d]" />

            <svg
                className="w-full h-full"
                viewBox="0 0 1920 1080"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                        <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow-strong">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* --- Left Side: Human Silhouette (Abstract) --- */}
                <g transform="translate(480, 540)" className="animate-breathe">
                    <circle r="60" fill="#222" stroke="#444" strokeWidth="2" />
                    <path d="M-60 100 Q 0 160 60 100 L 60 200 L -60 200 Z" fill="#222" stroke="#444" strokeWidth="2" />
                </g>

                {/* --- Right Side: AI Entity --- */}
                <g transform="translate(1440, 540)" className="animate-pulse-ai">
                    {/* Diamond Shape */}
                    <path d="M0 -80 L60 0 L0 80 L-60 0 Z" fill="rgba(34,211,238,0.1)" stroke="#22d3ee" strokeWidth="2" filter="url(#glow-strong)" />
                    <circle r="30" fill="#22d3ee" opacity="0.3" />
                </g>

                {/* --- Center: Audio Waves --- */}
                <g transform="translate(960, 540)">
                    {/* Multiple sine waves overlapping */}
                    <path d="M-300 0 Q -150 -50 0 0 Q 150 50 300 0" fill="none" stroke="url(#wave-gradient)" strokeWidth="3" className="animate-wave-1" />
                    <path d="M-300 0 Q -150 50 0 0 Q 150 -50 300 0" fill="none" stroke="url(#wave-gradient)" strokeWidth="3" className="animate-wave-2" />
                </g>

                {/* --- Floating Insight Bubbles --- */}
                <g className="animate-float-bubbles">
                    <rect x="800" y="300" width="180" height="40" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                    <text x="890" y="325" fill="#22d3ee" textAnchor="middle" fontSize="14" fontFamily="sans-serif">Interest Detected</text>
                </g>

                <g className="animate-float-bubbles-delayed">
                    <rect x="1100" y="700" width="160" height="40" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                    <text x="1180" y="725" fill="#a78bfa" textAnchor="middle" fontSize="14" fontFamily="sans-serif">High Engagement</text>
                </g>


                <style jsx>{`
           .animate-breathe { animation: breathe 4s ease-in-out infinite; }
           .animate-pulse-ai { animation: pulse 3s ease-in-out infinite; }
           .animate-wave-1 { animation: wave 2s ease-in-out infinite alternate; }
           .animate-wave-2 { animation: wave 2.5s ease-in-out infinite alternate-reverse; }
           .animate-float-bubbles { animation: float 6s ease-in-out infinite; }
           .animate-float-bubbles-delayed { animation: float 6s ease-in-out infinite 3s; }

           @keyframes breathe { 0%,100% {transform: translate(480px, 540px) scale(0.98);} 50% {transform: translate(480px, 540px) scale(1.02);}}
           @keyframes pulse { 0%,100% {transform: translate(1440px, 540px) scale(0.95); opacity:0.8;} 50% {transform: translate(1440px, 540px) scale(1.05); opacity:1;}}
           @keyframes wave { 0% {d: path("M-300 0 Q -150 -50 0 0 Q 150 50 300 0");} 100% {d: path("M-300 0 Q -150 -80 0 0 Q 150 80 300 0");}}
           @keyframes float { 0%,100% {transform: translateY(0);} 50% {transform: translateY(-15px);}}
        `}</style>
            </svg>
        </div>
    );
}
