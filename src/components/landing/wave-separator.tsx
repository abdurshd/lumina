import { cn } from "@/lib/utils";

export function WaveSeparator({ className }: { className?: string }) {
    return (
        <div className={cn("absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none select-none", className)} style={{ height: '80px' }}>
            <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
                    fill="var(--section-alt-bg, #0d0d0d)" />
            </svg>
        </div>
    );
}
