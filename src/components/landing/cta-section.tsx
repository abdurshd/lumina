'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { motion } from 'framer-motion';
import { WaitlistForm } from '@/components/landing/waitlist-form';

export function CTASection() {
    return (
        <section className="relative w-full py-28 sm:py-40 overflow-hidden flex items-center justify-center bg-background">
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="glass-premium p-10 sm:p-20 text-center relative overflow-hidden group">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
                        >
                            <LuminaIcon className="h-8 w-8 text-primary" />
                        </motion.div>

                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold mb-6 tracking-tight text-foreground leading-tight">
                            Ready for a more grounded career signal?
                        </h2>

                        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                            Start with the assessment, then let Lumina decide what evidence it still needs before generating your report.
                        </p>

                        <div className="mx-auto max-w-xl">
                            <WaitlistForm source="cta_section" />
                        </div>

                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6 relative z-20">
                            <Link href="/pricing" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full">
                                    See pricing <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="#how-it-works" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full">
                                    Learn more
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
