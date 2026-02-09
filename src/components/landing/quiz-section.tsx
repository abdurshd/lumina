'use client';

import { Compass, Heart, Zap, BookOpen, Target, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { NeuralBrainScene } from '@/components/landing/svg/neural-brain-scene';
import { QuizMockup } from '@/components/landing/mockups/quiz-mockup';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { slideInRight, slideInLeft } from '@/lib/motion';

const MODULES = [
    { icon: Compass, title: "Interest Vectors", desc: "Mapping your curiosity landscape.", color: "text-blue-400" },
    { icon: Heart, title: "Value Axioms", desc: "Defining your core operational drivers.", color: "text-red-400" },
    { icon: Zap, title: "Kinetic Strengths", desc: "Identifying high-velocity skillsets.", color: "text-yellow-400" },
    { icon: BookOpen, title: "Neural Plasticity", desc: "Measuring learning rate and adaptation.", color: "text-green-400" },
    { icon: Target, title: "Boundary Analysis", desc: "Optimizing within constraints.", color: "text-purple-400" },
];

export function QuizSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section id="quiz" ref={containerRef} className="bg-background py-32 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">

                    {/* Left: Text and Modules */}
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="mb-12"
                        >
                            <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Adaptive Intelligence</span>
                            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground mb-8 leading-[0.9]">
                                Neural <br /> <span className="text-primary">Profiling</span>
                            </h2>
                            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
                                Our dynamic assessment engine adapts its trajectory in micro-seconds,
                                probing the depths of your cognitive architecture to reveal your true potential.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {MODULES.map((mod, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                >
                                    <div className="glass-premium flex items-center gap-6 p-6 group cursor-pointer hover:border-primary/40 transition-all duration-500">
                                        <div className={`h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/20 ${mod.color} group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500`}>
                                            <mod.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-foreground font-black text-lg tracking-tight uppercase group-hover:text-primary transition-colors">{mod.title}</h4>
                                            <p className="text-sm text-muted-foreground font-light">{mod.desc}</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Mockup with Parallax effect */}
                    <div className="lg:w-1/2 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="relative z-10 perspective-2000"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="glass-premium rounded-[32px] overflow-hidden border-primary/20 p-2 shadow-2xl shadow-primary/20">
                                    <QuizMockup />
                                </div>
                            </div>

                            {/* Floating Brain Icon Component - Abstract representation */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 opacity-50 pointer-events-none">
                                <NeuralBrainScene />
                            </div>
                        </motion.div>

                        {/* Background Accents for Depth */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[150px] -z-10" />
                    </div>
                </div>
            </div>
        </section>
    );
}
