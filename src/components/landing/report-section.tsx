'use client';

import { FileCheck, BarChart3, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReportConstellationScene } from '@/components/landing/svg/report-constellation-scene';
import { ReportMockup } from '@/components/landing/mockups/report-mockup';

const HIGHLIGHTS = [
    { icon: FileCheck, title: "Traceable Origins", text: "Every insight is bound to a specific semantic trace from your digital footprint." },
    { icon: BarChart3, title: "Precision Metrics", text: "Quantum-grade confidence scoring for every professional prediction." },
    { icon: ListTodo, title: "Evolutionary Roadmap", text: "A concrete, 30-day kinetic plan to catalyze your professional transition." },
];

export function ReportSection() {
    return (
        <section id="report" className="bg-background py-32 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Final Synthesis</span>
                        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter text-foreground mb-8 leading-[0.9]">
                            Talent <br /> <span className="text-primary">Manifesto</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed">
                            The culmination of your journey. A dense, high-fidelity report detailing
                            your cognitive architecture and the career trajectories where you will dominate.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-32 relative perspective-3000"
                >
                    <div className="absolute -inset-20 bg-primary/5 rounded-full blur-[150px] -z-10 animate-pulse-glow" />
                    <div className="glass-premium rounded-[48px] overflow-hidden border-primary/20 p-4 shadow-[0_0_50px_oklch(75%_0.18_200/0.15)] bg-background/80">
                        <ReportMockup />
                    </div>

                    {/* Floating Constellation Decorative Element */}
                    <div className="absolute -top-24 -left-24 w-80 h-80 opacity-30 pointer-events-none">
                        <ReportConstellationScene />
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-10">
                    {HIGHLIGHTS.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                        >
                            <div className="glass-premium p-10 text-center h-full group hover:border-primary/40 transition-all duration-500">
                                <div className="h-20 w-20 mx-auto rounded-3xl bg-primary/5 flex items-center justify-center mb-8 border border-primary/20 text-primary group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-[0_0_30px_oklch(75%_0.18_200/0.3)] transition-all duration-500">
                                    <item.icon className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight text-foreground uppercase group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-muted-foreground font-light leading-relaxed">{item.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[180px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />
        </section>
    );
}
