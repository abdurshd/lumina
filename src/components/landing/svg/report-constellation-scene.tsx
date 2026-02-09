'use client';

export function ReportConstellationScene() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            <div className="absolute inset-0 bg-[#0d0d0d]" />

            <svg
                className="w-full h-full"
                viewBox="0 0 1920 1080"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="star-glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* --- Constellation Hexagon Radar --- */}
                <g transform="translate(960, 540) scale(3)">
                    {/* Web Grid */}
                    <polygon points="0,-100 86,-50 86,50 0,100 -86,50 -86,-50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* Data Shape */}
                    <polygon
                        points="0,-80 70,-20 60,40 0,90 -40,40 -70,-30"
                        fill="rgba(34, 211, 238, 0.1)"
                        stroke="#22d3ee"
                        strokeWidth="2"
                        filter="url(#star-glow)"
                        className="animate-draw-shape"
                    />

                    {/* Vertices Stars */}
                    <circle cx="0" cy="-80" r="3" fill="#fff" className="animate-twinkle" />
                    <circle cx="70" cy="-20" r="3" fill="#fff" className="animate-twinkle" style={{ animationDelay: '0.2s' }} />
                    <circle cx="60" cy="40" r="3" fill="#fff" className="animate-twinkle" style={{ animationDelay: '0.4s' }} />
                    <circle cx="0" cy="90" r="3" fill="#fff" className="animate-twinkle" style={{ animationDelay: '0.6s' }} />
                    <circle cx="-40" cy="40" r="3" fill="#fff" className="animate-twinkle" style={{ animationDelay: '0.8s' }} />
                    <circle cx="-70" cy="-30" r="3" fill="#fff" className="animate-twinkle" style={{ animationDelay: '1s' }} />
                </g>

                {/* --- Background Stars --- */}
                <circle cx="200" cy="200" r="1.5" fill="#fff" opacity="0.3" className="animate-twinkle" />
                <circle cx="1700" cy="300" r="2" fill="#fff" opacity="0.4" className="animate-twinkle" style={{ animationDelay: '1.5s' }} />
                <circle cx="400" cy="900" r="1" fill="#fff" opacity="0.2" className="animate-twinkle" />

                <style jsx>{`
           .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
           .animate-draw-shape { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 4s ease-out forwards; }
           
           @keyframes twinkle {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.5); }
           }
           @keyframes draw {
              to { stroke-dashoffset: 0; }
           }
        `}</style>
            </svg>
        </div>
    );
}
