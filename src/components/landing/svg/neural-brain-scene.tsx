'use client';

export function NeuralBrainScene() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            <div className="absolute inset-0 bg-[#0d0d0d]" />

            <svg
                className="w-full h-full"
                viewBox="0 0 1920 1080"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <radialGradient id="brain-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.2)" />
                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                    </radialGradient>
                </defs>

                {/* Background Glow */}
                <circle cx="960" cy="540" r="400" fill="url(#brain-glow)" />

                {/* --- Simplified Low-Poly Brain Structure --- */}
                {/* We'll abstract this as connected polygons */}
                <g transform="translate(960, 540) scale(1.2)" stroke="#22d3ee" strokeWidth="1" fill="rgba(34, 211, 238, 0.05)">

                    {/* Left Hemisphere */}
                    <path d="M-100 -50 L-150 0 L-100 80 L-20 100 L-20 -80 Z" className="animate-pulse-segment-1" />
                    <path d="M-150 0 L-200 20 L-180 80 L-100 80 Z" className="animate-pulse-segment-2" />

                    {/* Right Hemisphere */}
                    <path d="M100 -50 L150 0 L100 80 L20 100 L20 -80 Z" className="animate-pulse-segment-3" />
                    <path d="M150 0 L200 20 L180 80 L100 80 Z" className="animate-pulse-segment-4" />

                    {/* Connections (Synapses) */}
                    <line x1="-150" y1="0" x2="-20" y2="-80" strokeOpacity="0.5" className="animate-synapse" />
                    <line x1="150" y1="0" x2="20" y2="-80" strokeOpacity="0.5" className="animate-synapse-delayed" />
                    <line x1="-100" y1="80" x2="100" y2="80" strokeOpacity="0.5" />
                </g>

                {/* --- Floating Quiz Cards --- */}
                <g className="animate-float-cards">
                    {/* Card 1 */}
                    <rect x="600" y="300" width="120" height="160" rx="10"
                        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" transform="rotate(-15 660 380)" />
                    <text x="660" y="380" fill="#fff" textAnchor="middle" fontSize="40" opacity="0.5" transform="rotate(-15 660 380)">?</text>

                    {/* Card 2 */}
                    <rect x="1200" y="400" width="120" height="160" rx="10"
                        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" transform="rotate(10 1260 480)" />
                    <circle cx="1260" cy="450" r="10" fill="none" stroke="#fff" strokeOpacity="0.5" transform="rotate(10 1260 480)" />
                    <circle cx="1260" cy="490" r="10" fill="none" stroke="#fff" strokeOpacity="0.5" transform="rotate(10 1260 480)" />
                </g>

                <style jsx>{`
           .animate-pulse-segment-1 { animation: pulse-fill 4s infinite; }
           .animate-pulse-segment-2 { animation: pulse-fill 4s infinite 1s; }
           .animate-pulse-segment-3 { animation: pulse-fill 4s infinite 0.5s; }
           .animate-pulse-segment-4 { animation: pulse-fill 4s infinite 1.5s; }
           
           .animate-synapse { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 2s ease-out infinite; }
           .animate-synapse-delayed { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 2s ease-out infinite 1s; }

           .animate-float-cards { animation: float 8s ease-in-out infinite; }

           @keyframes pulse-fill {
             0%, 100% { fill-opacity: 0.05; }
             50% { fill-opacity: 0.3; }
           }
           @keyframes draw {
             to { stroke-dashoffset: 0; }
           }
           @keyframes float {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-20px); }
           }
        `}</style>
            </svg>
        </div>
    );
}
