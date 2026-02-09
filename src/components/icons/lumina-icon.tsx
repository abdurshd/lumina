import { forwardRef, type SVGProps } from 'react';
import type { LucideIcon } from 'lucide-react';

interface LuminaIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const LuminaIconBase = forwardRef<SVGSVGElement, LuminaIconProps>(
  ({ size, className, style, ...props }, ref) => {
    const s = size ?? 24;
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        {...props}
      >
        {/* Prism — upward-pointing triangle, shifted left to leave room for rays */}
        <path d="M10 3L17 19H3Z" />

        {/* Input beam — dashes flow toward the prism */}
        <line
          x1="1" y1="13" x2="5.5" y2="13"
          strokeDasharray="1.5 3"
          className="animate-lumina-beam"
        />

        {/* Refracted rays — dashes flow outward with staggered phase */}
        <line
          x1="13" y1="9" x2="23" y2="4"
          strokeDasharray="2 4"
          className="animate-lumina-ray"
        />
        <line
          x1="14.5" y1="12" x2="23" y2="12"
          strokeDasharray="2 4"
          className="animate-lumina-ray"
          style={{ animationDelay: '0.3s' }}
        />
        <line
          x1="16" y1="16" x2="23" y2="20"
          strokeDasharray="2 4"
          className="animate-lumina-ray"
          style={{ animationDelay: '0.6s' }}
        />
      </svg>
    );
  }
);

LuminaIconBase.displayName = 'LuminaIcon';

export const LuminaIcon = LuminaIconBase as unknown as LucideIcon;
