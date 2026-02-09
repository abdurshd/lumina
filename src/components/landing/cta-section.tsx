'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { fadeInScale } from '@/lib/motion';

export function CTASection() {
    return (
        <section className="relative w-full py-24 sm:py-32 overflow-hidden flex items-center justify-center">
            {/* Background ambient glow */}
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute inset-0 bg-[url('/lumina-abstract-bg.png')] bg-cover bg-center opacity-20 mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <ScrollReveal variants={fadeInScale} className="max-w-4xl mx-auto">
                    <div className="glass-heavy p-10 sm:p-20 text-center relative overflow-hidden group">

                        {/* Animated Prism Icon */}
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border-2 border-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <LuminaIcon className="h-10 w-10 text-primary" />
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                            Ready to <span className="text-gradient-gold">illuminate</span> your potential?
                        </h2>

                        <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg sm:text-xl leading-relaxed">
                            Join Lumina today and let our multimodal AI reveal the career talents you didn&apos;t know you had.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/login">
                                <Button size="lg" className="h-14 px-8 text-lg gap-2 btn-3d-primary rounded-2xl w-full sm:w-auto">
                                    Get Started Free <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg btn-3d-outline rounded-2xl w-full sm:w-auto">
                                    Learn More
                                </Button>
                            </Link>
                        </div>

                        {/* Decorative decorative shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shimmer pointer-events-none" />
                    </div>
                </ScrollReveal>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%) skewX(12deg); }
        }
        .group-hover\\:animate-shimmer {
           animation: shimmer 1.5s infinite;
        }
      `}</style>
        </section>
    );
}
