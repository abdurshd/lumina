import { cn } from "@/lib/utils";

export function TornEdge({ className }: { className?: string }) {
  return (
    <div 
      className={cn("absolute bottom-0 left-0 w-full h-12 sm:h-20 z-10 pointer-events-none select-none", className)}
      style={{
        background: 'var(--background)',
        clipPath: `polygon(0% 65%, 2% 55%, 5% 70%, 8% 50%, 12% 68%, 15% 45%, 18% 60%, 22% 42%, 25% 65%, 28% 48%, 32% 70%, 35% 52%, 38% 63%, 42% 45%, 45% 68%, 48% 50%, 52% 72%, 55% 48%, 58% 65%, 62% 42%, 65% 60%, 68% 45%, 72% 68%, 75% 52%, 78% 70%, 82% 48%, 85% 63%, 88% 45%, 92% 68%, 95% 55%, 98% 65%, 100% 50%, 100% 100%, 0% 100%)`
      }}
    />
  );
}
