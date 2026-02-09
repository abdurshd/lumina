'use client';

import { Video, Sparkles, Eye, MessageCircle } from 'lucide-react';
import { DarkSectionHero } from './section-hero';
import { LightSectionContent } from './section-content';
import { SessionScene } from '@/components/landing/svg/session-scene';
import { SessionMockup } from '@/components/landing/mockups/session-mockup';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { slideInLeft } from '@/lib/motion';

const FEATURES = [
    { icon: Video, title: "Voice & Video Analysis", text: "We analyze tone, pitch, and non-verbal cues to understand not just what you say, but how you feel." },
    { icon: Sparkles, title: "Real-time Adaptation", text: "The AI dynamically adjusts its questioning strategy based on your engagement and enthusiasm levels." },
    { icon: Eye, title: "Expression Reading", text: "Micro-expressions reveal hidden passions and hesitations that standard text forms miss completely." },
    { icon: MessageCircle, title: "Natural Conversation", text: "Speak naturally. It feels less like a test and more like a chat with a career counselor who truly listens." },
];

export function SessionSection() {
    return (
        <>
            <DarkSectionHero
                id="session"
                title="Live AI Session"
                subtitle="A real-time video conversation with an AI career counselor that understands your expressions, tone, and enthusiasm."
                visual={<SessionScene />}
            />

            <LightSectionContent className="bg-background">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Left: Mockup */}
                    <div className="order-1">
                        <ScrollReveal variants={slideInLeft}>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-50" />
                                <SessionMockup />
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right: Features */}
                    <div className="order-2">
                        <StaggerList className="grid gap-8">
                            {FEATURES.map((feature, i) => (
                                <StaggerItem key={i}>
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 shrink-0 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                                            <feature.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">{feature.text}</p>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerList>
                    </div>

                </div>
            </LightSectionContent>
        </>
    );
}
