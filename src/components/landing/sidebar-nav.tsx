'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SECTIONS = [
    { id: 'hero', label: 'Start', roman: '01' },
    { id: 'quiz', label: 'Assessment', roman: '02' },
    { id: 'session', label: 'Session', roman: '03' },
    { id: 'report', label: 'Report', roman: '04' },
    { id: 'how-it-works', label: 'Method', roman: '05' },
];

export function SidebarNav() {
    const [activeSection, setActiveSection] = useState('hero');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setVisible(true);
            } else {
                setVisible(false);
            }

            const sections = SECTIONS.map(s => document.getElementById(s.id));
            const scrollPosition = window.scrollY + window.innerHeight * 0.4;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(SECTIONS[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.nav
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block"
                >
                    <ul className="space-y-6">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <button
                                    onClick={() => scrollToSection(section.id)}
                                    className={cn(
                                        "group flex items-center gap-4 transition-all duration-500 text-left",
                                        activeSection === section.id
                                            ? "text-primary"
                                            : "text-muted-foreground/40 hover:text-foreground/80"
                                    )}
                                >
                                    <span className={cn(
                                        "text-[10px] font-semibold tracking-widest transition-all duration-300",
                                        activeSection === section.id ? "scale-125" : "scale-100"
                                    )}>
                                        {section.roman}
                                    </span>

                                    <div className="relative h-px w-8 bg-current transition-all duration-500 overflow-hidden">
                                        {activeSection === section.id && (
                                            <motion.div
                                                layoutId="active-line"
                                                className="absolute inset-0 bg-primary"
                                            />
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-xs font-medium transition-all duration-300 whitespace-nowrap",
                                        activeSection === section.id
                                            ? "opacity-100 translate-x-0"
                                            : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                                    )}>
                                        {section.label}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
