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

        {/* Input beam — enters the left face at y=13 */}
        <line x1="1" y1="13" x2="5.5" y2="13" />

        {/* Refracted rays — exit the right face at different heights and fan out */}
        <line
          x1="13" y1="9" x2="23" y2="4"
          className="animate-lumina-refract"
        />
        <line
          x1="14.5" y1="12" x2="23" y2="12"
          className="animate-lumina-refract"
          style={{ animationDelay: '0.8s' }}
        />
        <line
          x1="16" y1="16" x2="23" y2="20"
          className="animate-lumina-refract"
          style={{ animationDelay: '1.6s' }}
        />
      </svg>
    );
  }
);

LuminaIconBase.displayName = 'LuminaIcon';

export const LuminaIcon = LuminaIconBase as unknown as LucideIcon;
