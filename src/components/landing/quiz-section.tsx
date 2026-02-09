'use client';

import { Compass, Heart, Zap, BookOpen, Target, ArrowRight } from 'lucide-react';
import { DarkSectionHero } from './section-hero';
import { LightSectionContent } from './section-content';
import { NeuralBrainScene } from '@/components/landing/svg/neural-brain-scene';
import { QuizMockup } from '@/components/landing/mockups/quiz-mockup';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { slideInRight, slideInLeft } from '@/lib/motion';

const MODULES = [
    { icon: Compass, title: "Interests", desc: "What fascinates you?", color: "text-blue-400" },
    { icon: Heart, title: "Work Values", desc: "What drives you?", color: "text-red-400" },
    { icon: Zap, title: "Strengths", desc: "Where do you excel?", color: "text-yellow-400" },
    { icon: BookOpen, title: "Learning", desc: "How do you grow?", color: "text-green-400" },
    { icon: Target, title: "Constraints", desc: "What are your limits?", color: "text-purple-400" },
];

export function QuizSection() {
    return (
        <>
            <DarkSectionHero
                id="quiz"
                title="AI-Adaptive Quiz"
                subtitle="Questions that evolve based on your answers. Five modules probing every dimension of your potential."
                visual={<NeuralBrainScene />}
            />

            <LightSectionContent className="bg-background">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Modules List */}
                    <div className="order-2 lg:order-1">
                        <ScrollReveal variants={slideInLeft} className="mb-10">
                            <h3 className="text-3xl font-bold mb-4">Deep Assessment</h3>
                            <p className="text-muted-foreground text-lg">
                                Our adaptive engine adjusts difficulty and focus in real-time, ensuring a precise map of your capabilities in under 15 minutes.
                            </p>
                        </ScrollReveal>

                        <StaggerList className="space-y-4">
                            {MODULES.map((mod, i) => (
                                <StaggerItem key={i}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors">
                                        <div className={`h-10 w-10 rounded-lg bg-background flex items-center justify-center ${mod.color}`}>
                                            <mod.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{mod.title}</h4>
                                            <p className="text-xs text-muted-foreground">{mod.desc}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerList>
                    </div>

                    {/* Right: Interactive Mockup */}
                    <div className="order-1 lg:order-2 perspective-1000">
                        <ScrollReveal variants={slideInRight}>
                            <div className="relative transform transition-transform hover:rotate-y-2 duration-500 preserve-3d">
                                <QuizMockup />

                                {/* Decorative Elements around mockup */}
                                <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/20 blur-3xl rounded-full" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
                            </div>
                        </ScrollReveal>
                    </div>

                </div>
            </LightSectionContent>
        </>
    );
}
