'use client';

import { Mail, FolderOpen, FileText, MessageSquare, Shield } from 'lucide-react';
import { DarkSectionHero } from './section-hero';
import { LightSectionContent } from './section-content';
import { DataNetworkScene } from '@/components/landing/svg/data-network-scene';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';

const DATA_SOURCES = [
    {
        icon: Mail,
        title: "Email Pattern Analysis",
        description: "We analyze communication styles, responsiveness, and network density to understand your professional relationships."
    },
    {
        icon: FolderOpen,
        title: "Document Insights",
        description: "Your created documents reveal your organizational skills, attention to detail, and preferred working structures."
    },
    {
        icon: FileText,
        title: "Knowledge Graph",
        description: "Notion workspaces map out your interests, learning habits, and how you structure complex information."
    },
    {
        icon: MessageSquare,
        title: "Conversation Mining",
        description: "ChatGPT history highlights your curiosity, problem-solving approaches, and the questions you ask most."
    }
];

export function DataAnalysisSection() {
    return (
        <>
            <DarkSectionHero
                id="data"
                title="Data Analysis"
                subtitle="We find patterns in your digital life you never noticed."
                visual={<DataNetworkScene />}
            />

            <LightSectionContent className="bg-background">
                <StaggerList className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto mb-16">
                    {DATA_SOURCES.map((source, i) => (
                        <StaggerItem key={i}>
                            <div className="card-raised p-8 h-full bg-card hover:border-primary/50 transition-colors">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary">
                                    <source.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 font-sans">{source.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{source.description}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerList>

                <ScrollReveal>
                    <div className="glass-heavy max-w-3xl mx-auto p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-1">Privacy First</h4>
                            <p className="text-sm text-muted-foreground">
                                Your data is analyzed transiently. Raw content is never stored permanently. Only derived insights are kept for your report.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </LightSectionContent>
        </>
    );
}
