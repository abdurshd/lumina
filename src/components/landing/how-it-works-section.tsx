'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const STEPS = [
    { id: '01', title: 'Connect sources', desc: 'Link the work data you want Lumina to consider, with consent and clear boundaries.' },
    { id: '02', title: 'Answer modules', desc: 'Complete adaptive prompts that focus on interests, values, strengths, and constraints.' },
    { id: '03', title: 'Talk it through', desc: 'Use the live session to clarify uncertain signals and add personal context.' },
    { id: '04', title: 'Review the report', desc: 'See matches, confidence, evidence, and concrete next steps in one place.' },
];

export function HowItWorksSection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
    const xSpring = useSpring(x, { stiffness: 100, damping: 30 });

    return (
        <section ref={targetRef} className="relative h-[400vh] bg-background">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                {/* Section Header (Fixed) */}
                <div className="absolute top-20 left-10 md:left-20 z-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-primary font-semibold tracking-wide text-sm mb-4 block">Method</span>
                        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">How Lumina works</h2>
                    </motion.div>
                </div>

                {/* Horizontal Scroll Track */}
                <motion.div style={{ x: xSpring }} className="flex gap-10 px-10 md:px-20 min-w-max">
                    {/* Empty spacer for initial header visibility */}
                    <div className="w-[30vw]" />

                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className="relative group w-[360px] md:w-[560px] h-[380px] md:h-[460px]"
                        >
                            <div className="absolute inset-0 glass-premium rounded-2xl p-8 md:p-10 flex flex-col justify-end transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-primary/[0.02]">
                                <div className="absolute top-0 right-0 p-8 md:p-10">
                                    <span className="text-7xl font-semibold text-foreground/5 tracking-tight transition-colors duration-200 group-hover:text-primary/10">
                                        {step.id}
                                    </span>
                                </div>

                                <div className="relative z-10">
                                    <div className="w-10 h-px bg-primary/50 mb-6 transition-all duration-200 group-hover:w-16" />
                                    <h3 className="text-3xl md:text-4xl font-semibold text-foreground mb-5 tracking-tight leading-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-sm">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative line between steps */}
                            {i < STEPS.length - 1 && (
                                <div className="absolute top-1/2 -right-10 w-10 h-px bg-primary/10" />
                            )}
                        </div>
                    ))}

                    {/* Final Spacer */}
                    <div className="w-[10vw]" />
                </motion.div>

                {/* Progress Bar (Bottom) */}
                <div className="absolute bottom-20 left-10 right-10 md:left-20 md:right-20 h-px bg-foreground/5">
                    <motion.div
                        className="h-full bg-primary"
                        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                    />
                </div>
            </div>

        </section>
    );
}
