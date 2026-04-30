'use client';

import { Video, Sparkles, Eye, MessageCircle, ShieldCheck, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SessionScene } from '@/components/landing/svg/session-scene';
import { SessionMockup } from '@/components/landing/mockups/session-mockup';

const FEATURES = [
    { icon: Video, title: "Live context", text: "A guided conversation adds nuance that static forms usually miss." },
    { icon: Sparkles, title: "Adaptive prompts", text: "The session follows up where your earlier evidence is thin or uncertain." },
    { icon: Eye, title: "Behavioral signals", text: "Patterns over time help separate steady interests from passing preferences." },
    { icon: MessageCircle, title: "Natural dialogue", text: "The counselor keeps the interview structured without making it feel rigid." },
];

const OBSERVE_LIST = [
    "Engagement — turn-taking and follow-up depth",
    "Hesitation — pauses on specific question categories",
    "Confidence patterns — voice steadiness and certainty markers",
    "Communication style — concision, narrative, abstraction",
];

const NEVER_CLAIM_LIST = [
    "Identity recognition or face matching from your video",
    "Medical, mood, or mental-health diagnosis",
    "Immutable personality labels — only tendencies with evidence",
    "Hiring or admissions decisions from a session alone",
];

export function SessionSection() {
    return (
        <section id="session" className="bg-background py-32 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="mx-auto mb-16 max-w-5xl"
                >
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                            <ShieldCheck className="h-3 w-3" />
                            Consent-only behavioral observation
                        </span>
                        <Link
                            href="/security"
                            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                            Read the full security posture &rarr;
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                <Eye className="h-4 w-4" />
                                What we observe (with consent)
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-foreground">
                                {OBSERVE_LIST.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                                <EyeOff className="h-4 w-4" />
                                What we never claim
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-foreground">
                                {NEVER_CLAIM_LIST.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-500" />
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-center gap-24">

                    {/* Left: Interactive Mockup */}
                    <div className="lg:w-1/2 relative order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -50, scale: 0.95 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="glass-premium rounded-2xl overflow-hidden p-2 shadow-sm shadow-shadow-subtle">
                                <SessionMockup />
                            </div>

                            {/* Decorative Floating Icon */}
                            <div className="absolute -bottom-8 -right-8 w-40 h-40 opacity-20">
                                <SessionScene />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Text and Features */}
                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="mb-12"
                        >
                            <span className="text-primary font-semibold tracking-wide text-sm mb-4 block">Guided AI session</span>
                            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
                                A conversation with a clear purpose
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                Lumina uses the session to test uncertain signals, ask better follow-ups, and build a more grounded profile.
                            </p>
                        </motion.div>

                        <div className="grid gap-6">
                            {FEATURES.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                >
                                    <div className="glass-premium p-5 group hover:border-primary/30 transition-colors duration-200">
                                        <div className="flex gap-5 items-start">
                                            <div className="h-11 w-11 shrink-0 rounded-lg bg-primary/8 flex items-center justify-center border border-primary/15 text-primary">
                                                <feature.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-foreground font-semibold text-lg tracking-tight mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
