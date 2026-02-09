'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { slideInLeft } from '@/lib/motion';

const SECTIONS = [
    { id: 'discovery', label: 'Discovery', roman: 'I' },
    { id: 'data', label: 'Data', roman: 'II' },
    { id: 'quiz', label: 'Quiz', roman: 'III' },
    { id: 'session', label: 'Session', roman: 'IV' },
    { id: 'report', label: 'Report', roman: 'V' },
    { id: 'how-it-works', label: 'How It Works', roman: 'VI' },
];

export function SidebarNav() {
    const [activeSection, setActiveSection] = useState('discovery');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show sidebar after scrolling past hero (approx 50vh)
            if (window.scrollY > window.innerHeight * 0.5) {
                setVisible(true);
            } else {
                setVisible(false);
            }

            // Determine active section
            const sections = SECTIONS.map(s => document.getElementById(s.id));
            const scrollPosition = window.scrollY + window.innerHeight * 0.3;

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
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={slideInLeft}
                    className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden lg:block"
                >
                    <ul className="space-y-3">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <button
                                    onClick={() => scrollToSection(section.id)}
                                    className={cn(
                                        "group flex items-center gap-3 text-xs font-mono transition-colors text-left w-full hover:text-foreground",
                                        activeSection === section.id
                                            ? "text-primary font-bold"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <span className={cn(
                                        "w-6 text-right transition-colors",
                                        activeSection === section.id ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                                    )}>
                                        {section.roman}
                                    </span>
                                    <span className={cn(
                                        "h-[1px] bg-border transition-all w-4 group-hover:w-6 group-hover:bg-foreground/20",
                                        activeSection === section.id ? "w-8 bg-primary" : "bg-border"
                                    )} />
                                    <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
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
