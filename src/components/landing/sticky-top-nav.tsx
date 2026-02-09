'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const NAV_LINKS = [
    { name: 'ANALYSIS', href: '#quiz' },
    { name: 'SYNERGY', href: '#session' },
    { name: 'MANIFESTO', href: '#report' },
    { name: 'PROTOCOL', href: '#how-it-works' },
];

export function StickyTopNav() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = React.useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <motion.header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                isScrolled ? "glass-premium py-3 border-b border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <LuminaIcon className="h-9 w-9 text-primary transition-transform duration-500 group-hover:rotate-[360deg]" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-foreground uppercase">Lumina</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[11px] font-black tracking-[0.2em] text-muted-foreground hover:text-primary transition-all duration-300 relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                    <div className="flex items-center gap-6 pl-4 border-l border-white/10">
                        <ThemeToggle />
                        <Link href="/login">
                            <Button size="sm">
                                START EXTRACTION
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Mobile Nav */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggle />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-foreground hover:bg-foreground/10">
                                <Menu className="h-7 w-7" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:w-[400px] border-l border-primary/20 bg-background p-0">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation menu</SheetTitle>
                                <SheetDescription>
                                    Main section links and sign-in entry point.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="flex flex-col h-full bg-background p-10">
                                <Link href="/" className="flex items-center gap-3 mb-16">
                                    <LuminaIcon className="h-10 w-10 text-primary" />
                                    <span className="font-black text-3xl tracking-tighter text-foreground uppercase">Lumina</span>
                                </Link>
                                <nav className="flex flex-col gap-8">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="text-4xl font-black tracking-tighter text-muted-foreground hover:text-primary transition-all duration-300 hover:pl-4"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <div className="mt-12 pt-12 border-t border-white/10">
                                        <Link href="/login">
                                            <Button size="lg" className="w-full">START EXTRACTION</Button>
                                        </Link>
                                    </div>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.header>
    );
}
