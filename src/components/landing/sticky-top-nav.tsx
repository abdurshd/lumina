'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_LINKS = [
    { name: 'Analysis', href: '#analysis' },
    { name: 'Quiz', href: '#quiz' },
    { name: 'Live Session', href: '#session' },
    { name: 'Report', href: '#report' },
    { name: 'How It Works', href: '#how-it-works' },
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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                isScrolled ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm py-3" : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <LuminaIcon className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
                    <span className="font-bold text-xl tracking-tight">Lumina</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link href="/login">
                        <Button size="sm" className="btn-3d-primary rounded-full px-6">
                            Get Started
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Nav */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] border-l border-border/50 backdrop-blur-xl bg-background/90">
                            <div className="flex flex-col gap-8 mt-10">
                                <Link href="/" className="flex items-center gap-2 mb-4">
                                    <LuminaIcon className="h-8 w-8 text-primary" />
                                    <span className="font-bold text-xl">Lumina</span>
                                </Link>
                                <nav className="flex flex-col gap-4">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors border-b border-border/50 pb-2"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <Link href="/login" className="mt-4">
                                        <Button className="w-full btn-3d-primary">Get Started</Button>
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.header>
    );
}
