'use client';

import { FileCheck, BarChart3, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReportConstellationScene } from '@/components/landing/svg/report-constellation-scene';
import { ReportMockup } from '@/components/landing/mockups/report-mockup';

const HIGHLIGHTS = [
    { icon: FileCheck, title: "Traceable evidence", text: "Every major claim points back to the inputs that informed it." },
    { icon: BarChart3, title: "Confidence scoring", text: "The report separates strong signals from areas that need more evidence." },
    { icon: ListTodo, title: "Practical next steps", text: "A focused plan turns career direction into near-term action." },
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
                        <span className="text-primary font-semibold tracking-wide text-sm mb-4 block">Talent report</span>
                        <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
                            A career profile you can audit
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            The final report shows what Lumina believes, how confident it is, and what evidence shaped each recommendation.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-24 relative perspective-3000"
                >
                    <div className="glass-premium rounded-2xl overflow-hidden p-3 shadow-sm shadow-shadow-subtle bg-background/80">
                        <ReportMockup />
                    </div>

                    {/* Floating Constellation Decorative Element */}
                    <div className="absolute -top-20 -left-20 w-72 h-72 opacity-16 pointer-events-none">
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
                            <div className="glass-premium p-8 text-center h-full group hover:border-primary/30 transition-colors duration-200">
                                <div className="h-14 w-14 mx-auto rounded-lg bg-primary/8 flex items-center justify-center mb-6 border border-primary/15 text-primary">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 tracking-tight text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
