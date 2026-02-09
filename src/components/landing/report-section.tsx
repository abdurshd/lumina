'use client';

import { FileCheck, BarChart3, ListTodo } from 'lucide-react';
import { DarkSectionHero } from './section-hero';
import { LightSectionContent } from './section-content';
import { ReportConstellationScene } from '@/components/landing/svg/report-constellation-scene';
import { ReportMockup } from '@/components/landing/mockups/report-mockup';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { slideInFromBottom } from '@/lib/motion';

const HIGHLIGHTS = [
    { icon: FileCheck, title: "Evidence-Backed", text: "Every insight cites specific data points from your footprint or interview." },
    { icon: BarChart3, title: "Confidence Scoring", text: "We tell you exactly how certain we are about each prediction." },
    { icon: ListTodo, title: "Actionable Plan", text: "Get a concrete 30-day roadmap to explore your new career paths." },
];

export function ReportSection() {
    return (
        <>
            <DarkSectionHero
                id="report"
                title="Your Talent Report"
                subtitle="Radar charts, career paths, hidden talents, and a personalized action plan — all backed by evidence."
                visual={<ReportConstellationScene />}
            />

            <LightSectionContent className="bg-background">

                <div className="mb-20">
                    <ScrollReveal variants={slideInFromBottom}>
                        <ReportMockup />
                    </ScrollReveal>
                </div>

                <StaggerList className="grid md:grid-cols-3 gap-8">
                    {HIGHLIGHTS.map((item, i) => (
                        <StaggerItem key={i}>
                            <div className="text-center p-6">
                                <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4 border border-border group-hover:border-primary/50 transition-colors">
                                    <item.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerList>

            </LightSectionContent>
        </>
    );
}
