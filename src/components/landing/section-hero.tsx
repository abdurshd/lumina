'use client';

import { ReactNode } from 'react';

import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { fadeInScale } from '@/lib/motion';
import { FloatingParticles } from '@/components/landing/floating-particles';
import { TornEdge } from './torn-edge';

interface DarkSectionHeroProps {
    id: string;
    title: string;
    subtitle: string;
    visual: ReactNode;
    children?: ReactNode;
}

export function DarkSectionHero({ id, title, subtitle, visual, children }: DarkSectionHeroProps) {
    return (
        <section id={id} className="relative min-h-[80vh] w-full overflow-hidden bg-background flex items-center justify-center py-20">
            {/* Background Visual */}
            <div className="absolute inset-0 z-0">
                {visual}
                <FloatingParticles count={4} images={['/lumina-shard.png']} className="z-0 opacity-50" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                <ScrollReveal variants={fadeInScale} className="max-w-4xl mx-auto">
                    <h2 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-8 text-foreground relative inline-block">
                        {title}
                        {/* Optional decorative underline or glow could go here */}
                    </h2>
                </ScrollReveal>

                <ScrollReveal variants={fadeInScale} className="max-w-2xl mx-auto">
                    <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                        {subtitle}
                    </p>
                </ScrollReveal>

                {children && (
                    <div className="mt-10">
                        {children}
                    </div>
                )}
            </div>

            {/* Transition Edge */}
            <TornEdge />
        </section>
    );
}
