'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LightSectionContent } from './section-content';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { cn } from '@/lib/utils';


const STEPS = [
    { id: '01', title: 'Connect Data', desc: 'Securely link Gmail, Drive, or upload ChatGPT exports.' },
    { id: '02', title: 'Take Quiz', desc: 'Complete the 15-minute AI-adaptive assessment modules.' },
    { id: '03', title: 'Live Session', desc: 'Have a natural video conversation with your AI guide.' },
    { id: '04', title: 'Get Report', desc: 'Receive your comprehensive talent profile and action plan.' },
];

export function HowItWorksSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <LightSectionContent className="bg-[var(--section-alt-bg)]" showWave={false}>
            <div id="how-it-works" className="py-10" ref={containerRef}>
                <ScrollReveal className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-bold mb-4">How It Works</h2>
                    <p className="text-muted-foreground">From raw data to realized potential in four steps.</p>
                </ScrollReveal>

                <div className="relative">
                    {/* Desktop Horizontal Line */}
                    <div className="absolute top-8 left-0 w-full h-0.5 bg-border hidden md:block">
                        <motion.div
                            className="h-full bg-primary origin-left"
                            style={{ scaleX: lineWidth }}
                        />
                    </div>

                    {/* Mobile Vertical Line */}
                    <div className="absolute top-0 left-8 w-0.5 h-full bg-border md:hidden">
                        <motion.div
                            className="w-full bg-primary origin-top"
                            style={{ height: lineHeight, maxHeight: '100%' }}
                        />
                    </div>

                    <StaggerList className="grid md:grid-cols-4 gap-12 relative z-10">
                        {STEPS.map((step, i) => (
                            <StaggerItem key={i} className="flex md:flex-col items-start md:items-center gap-6 md:gap-4 md:text-center group">
                                <div className={cn(
                                    "h-16 w-16 shrink-0 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center font-mono font-bold text-lg text-primary transition-colors",
                                    "group-hover:border-primary group-hover:bg-primary/10"
                                )}>
                                    {step.id}
                                </div>
                                <div className="pt-2 md:pt-4">
                                    <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerList>
                </div>
            </div>
        </LightSectionContent>
    );
}
