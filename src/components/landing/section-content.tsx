'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { WaveSeparator } from './wave-separator';

interface LightSectionContentProps {
    children: ReactNode;
    className?: string;
    showWave?: boolean;
}

export function LightSectionContent({ children, className, showWave = true }: LightSectionContentProps) {
    return (
        <section className={cn("relative w-full bg-background py-20 sm:py-32", className)}>
            <div className="container mx-auto px-6 max-w-6xl">
                {children}
            </div>

            {showWave && <WaveSeparator />}
        </section>
    );
}
