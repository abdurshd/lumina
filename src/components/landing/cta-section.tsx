'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { motion } from 'framer-motion';
import { FloatingParticles } from './floating-particles';

export function CTASection() {
    return (
        <section className="relative w-full py-32 sm:py-48 overflow-hidden flex items-center justify-center bg-background">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full opacity-50" />
                <FloatingParticles count={6} className="z-0 opacity-30" />

                {/* Futuristic Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(75%_0.18_200/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(75%_0.18_200/0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="glass-premium p-12 sm:p-24 text-center relative overflow-hidden group border-primary/20">
                        {/* Shimmering background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

                        {/* Animated Icon */}
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-[0_0_30px_oklch(75%_0.18_200/0.2)]"
                        >
                            <LuminaIcon className="h-12 w-12 text-primary" />
                        </motion.div>

                        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black mb-8 tracking-tighter text-foreground leading-[0.85] uppercase">
                            Illuminate Your <br />
                            <span className="text-primary group-hover:text-foreground transition-colors duration-700">Potential</span>
                        </h2>

                        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                            The era of generic career paths is over. Step into the high-fidelity future of talent discovery.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-20">
                            <Link href="/login" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-premium w-full flex items-center justify-center gap-3 px-12 py-5 text-xl"
                                >
                                    Initialize Extraction <ArrowRight className="h-6 w-6" />
                                </motion.button>
                            </Link>
                            <Link href="/about" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-premium-outline w-full px-12 py-5 text-xl"
                                >
                                    Visualizer Specs
                                </motion.button>
                            </Link>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/30 animate-scanline pointer-events-none" />
                    </div>
                </motion.div>
            </div>

            {/* Scroll-to-top accent or final visual anchor */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>
    );
}
