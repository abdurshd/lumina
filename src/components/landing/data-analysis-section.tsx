'use client';

import { Mail, FolderOpen, FileText, MessageSquare, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import { ScrollReveal } from '@/components/motion/scroll-reveal';

const DATA_SOURCES = [
    {
        icon: Mail,
        title: "Communication patterns",
        description: "Find recurring interests, collaborators, and types of work in your professional messages."
    },
    {
        icon: FolderOpen,
        title: "Work artifacts",
        description: "Use documents and project files to understand what you build, revise, and return to."
    },
    {
        icon: FileText,
        title: "Knowledge traces",
        description: "Turn notes and knowledge bases into evidence about how you learn and organize ideas."
    },
    {
        icon: MessageSquare,
        title: "Question history",
        description: "Look at the themes behind your prompts and searches to identify durable curiosity."
    }
];

export function DataAnalysisSection() {


    return (
        <section className="bg-background py-24 relative overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="lg:w-1/2"
                    >
                        <span className="text-primary font-semibold tracking-wide text-sm mb-4 block">Data analysis</span>
                        <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
                            Evidence from the work you already do
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                            Lumina reads connected sources for recurring patterns, then uses those signals to guide the rest of the assessment.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="lg:w-1/2 relative min-h-[400px] w-full flex items-center justify-center"
                    >
                        <div className="relative w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden glass-premium shadow-sm shadow-shadow-subtle">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity dark:opacity-60 dark:mix-blend-luminosity opacity-80 mix-blend-multiply"
                            >
                                <source src="/hero-bg.mp4" type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-background/20" />
                            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />

                            {/* Futuristic reticle overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                <div className="w-24 h-24 rounded-full border border-primary/40 border-dashed animate-spin-slow" />
                                <div className="absolute w-32 h-32 rounded-full border border-primary/20" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 max-w-6xl mx-auto mb-20">
                    {DATA_SOURCES.map((source, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, y: 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                        >
                            <div className="glass-premium p-8 h-full group transition-colors duration-200 hover:border-primary/30">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/8 border border-primary/15 text-primary">
                                    <source.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 tracking-tight text-foreground">{source.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{source.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <ScrollReveal>
                    <div className="glass-premium max-w-3xl mx-auto p-10 flex flex-col sm:flex-row items-center gap-8 border-primary/10">
                        <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2 tracking-tight text-foreground">Privacy by default</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Raw source data is processed for assessment signals and kept out of the long-term profile.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

        </section>
    );
}
