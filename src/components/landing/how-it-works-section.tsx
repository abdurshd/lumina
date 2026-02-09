'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const STEPS = [
    { id: '01', title: 'Data Synthesis', desc: 'Securely link your professional footprint across Gmail, Drive, and social vectors.' },
    { id: '02', title: 'Neural Assessment', desc: 'Complete our AI-adaptive modules that map your cognitive and psychological architecture.' },
    { id: '03', title: 'Ethereal Interview', desc: 'Engage in a live, high-fidelity video session with our advanced Talent Oracle.' },
    { id: '04', title: 'Quantum Profile', desc: 'Unlock your multi-dimensional talent report with precise growth trajectories.' },
];

export function HowItWorksSection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
    const xSpring = useSpring(x, { stiffness: 100, damping: 30 });

    return (
        <section ref={targetRef} className="relative h-[400vh] bg-[#050505]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                {/* Section Header (Fixed) */}
                <div className="absolute top-20 left-10 md:left-20 z-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Methodology</span>
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">How Lumina Works</h2>
                    </motion.div>
                </div>

                {/* Horizontal Scroll Track */}
                <motion.div style={{ x: xSpring }} className="flex gap-10 px-10 md:px-20 min-w-max">
                    {/* Empty spacer for initial header visibility */}
                    <div className="w-[30vw]" />

                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className="relative group w-[400px] md:w-[600px] h-[400px] md:h-[500px]"
                        >
                            <div className="absolute inset-0 glass-premium rounded-3xl p-10 flex flex-col justify-end transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/[0.02]">
                                <div className="absolute top-0 right-0 p-10">
                                    <span className="text-8xl font-black text-white/5 tracking-tighter transition-all duration-500 group-hover:text-primary/10">
                                        {step.id}
                                    </span>
                                </div>

                                <div className="relative z-10">
                                    <div className="w-12 h-1 bg-primary/30 mb-6 transition-all duration-500 group-hover:w-24 group-hover:bg-primary" />
                                    <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-none uppercase">
                                        {step.title}
                                    </h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed max-w-sm font-light">
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
                <div className="absolute bottom-20 left-10 right-10 md:left-20 md:right-20 h-px bg-white/5">
                    <motion.div
                        className="h-full bg-primary shadow-[0_0_15px_oklch(75%_0.18_200)]"
                        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                    />
                </div>
            </div>

            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
            </div>
        </section>
    );
}
