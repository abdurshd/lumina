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
    { name: 'Assessment', href: '#quiz' },
    { name: 'Session', href: '#session' },
    { name: 'Report', href: '#report' },
    { name: 'Method', href: '#how-it-works' },
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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-background/85 py-3 border-b border-border backdrop-blur-md" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <LuminaIcon className="h-8 w-8 text-primary transition-colors duration-200 group-hover:text-foreground" />
                    </div>
                    <span className="font-semibold text-2xl tracking-tight text-foreground">Lumina</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full" />
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 pl-4 border-l border-border">
                        <ThemeToggle />
                        <Link href="/login">
                            <Button size="sm">
                                Start
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
                        <SheetContent side="right" className="w-full sm:w-[400px] border-l border-border bg-background p-0">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation menu</SheetTitle>
                                <SheetDescription>
                                    Main section links and sign-in entry point.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="flex flex-col h-full bg-background p-10">
                                <Link href="/" className="flex items-center gap-3 mb-16">
                                    <LuminaIcon className="h-10 w-10 text-primary" />
                                    <span className="font-semibold text-3xl tracking-tight text-foreground">Lumina</span>
                                </Link>
                                <nav className="flex flex-col gap-8">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="text-3xl font-semibold tracking-tight text-muted-foreground hover:text-foreground transition-all duration-200 hover:pl-2"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <div className="mt-12 pt-12 border-t border-border">
                                        <Link href="/login">
                                            <Button size="lg" className="w-full">Start assessment</Button>
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
