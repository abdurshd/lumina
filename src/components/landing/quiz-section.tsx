'use client';

import { Compass, Heart, Zap, BookOpen, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { NeuralBrainScene } from '@/components/landing/svg/neural-brain-scene';
import { QuizMockup } from '@/components/landing/mockups/quiz-mockup';

const MODULES = [
    { icon: Compass, title: "Interests", desc: "What naturally earns your attention." },
    { icon: Heart, title: "Values", desc: "The tradeoffs you want work to honor." },
    { icon: Zap, title: "Strengths", desc: "Where effort turns into useful momentum." },
    { icon: BookOpen, title: "Learning style", desc: "How you take in and apply new context." },
    { icon: Target, title: "Constraints", desc: "The conditions that shape viable paths." },
];

export function QuizSection() {
    return (
        <section id="quiz" className="bg-background py-32 relative overflow-hidden">
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
                            <span className="text-primary font-semibold tracking-wide text-sm mb-4 block">Adaptive assessment</span>
                            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
                                A profile that adapts as you answer
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                Each module narrows in on evidence that matters, so the assessment feels focused instead of repetitive.
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
                                    <div className="glass-premium flex items-center gap-5 p-5 group cursor-pointer hover:border-primary/30 transition-colors duration-200">
                                        <div className="h-11 w-11 rounded-lg bg-primary/8 flex items-center justify-center border border-primary/15 text-primary transition-colors duration-200">
                                            <mod.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-foreground font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">{mod.title}</h4>
                                            <p className="text-sm text-muted-foreground">{mod.desc}</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground/35 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
                                <div className="glass-premium rounded-2xl overflow-hidden p-2 shadow-sm shadow-shadow-subtle">
                                    <QuizMockup />
                                </div>
                            </div>

                            {/* Floating Brain Icon Component - Abstract representation */}
                            <div className="absolute -top-16 -right-16 w-56 h-56 opacity-20 pointer-events-none">
                                <NeuralBrainScene />
                            </div>
                        </motion.div>

                        {/* Background Accents for Depth */}
                        <div className="absolute inset-8 rounded-3xl border border-border -z-10" />
                    </div>
                </div>
            </div>
        </section>
    );
}
