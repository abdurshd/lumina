'use client';

import { Mail, FolderOpen, FileText, MessageSquare, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import { DataNetworkScene } from '@/components/landing/svg/data-network-scene';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

const DATA_SOURCES = [
    {
        icon: Mail,
        title: "Synthesis of Intent",
        description: "Deciphering professional communication vectors and relationship velocity through neural language modeling."
    },
    {
        icon: FolderOpen,
        title: "Structural Integrity",
        description: "Mapping your organizational DNA through the architectonics of your digital archive and file hierarchies."
    },
    {
        icon: FileText,
        title: "Cognitive Topography",
        description: "Extracting semantic networks from your knowledge bases to visualize your intellectual expansion."
    },
    {
        icon: MessageSquare,
        title: "Inquisitive Resonance",
        description: "Analyzing the depth and trajectory of your queries to reveal the core drivers of your curiosity."
    }
];

export function DataAnalysisSection() {


    return (
        <section className="bg-[#050505] py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="lg:w-1/2"
                    >
                        <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Neural Mapping</span>
                        <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
                            Digital <br /> <span className="text-primary">Archeology</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
                            We don&apos;t just scan data. We excavate the hidden structures of your professional soul,
                            turning fragmented digital traces into a coherent map of your ultimate potential.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="lg:w-1/2 relative min-h-[400px] w-full"
                    >
                        <DataNetworkScene />
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
                            <div className="glass-premium p-10 h-full group transition-all duration-500 hover:border-primary/40">
                                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/20 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_oklch(75%_0.18_200/0.3)]">
                                    <source.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tighter text-white uppercase">{source.title}</h3>
                                <p className="text-muted-foreground leading-relaxed font-light">{source.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <ScrollReveal>
                    <div className="glass-premium max-w-3xl mx-auto p-10 flex flex-col sm:flex-row items-center gap-8 border-primary/10">
                        <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_oklch(75%_0.18_200/0.2)]">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-2 tracking-tight text-white uppercase">Vault-Grade Security</h4>
                            <p className="text-muted-foreground font-light text-sm leading-relaxed">
                                Our analysis engine operates in a zero-persistence environment. Your raw data is processed in isolated memory and purged instantly. Only the semantic bridges remain.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Background Gradient Accents */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
        </section>
    );
}
