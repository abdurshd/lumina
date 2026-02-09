'use client';

import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 lg:hidden glass-premium border-b border-primary/20"
        >
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="text-foreground hover:bg-foreground/10"
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        <LuminaIcon className="h-6 w-6 text-primary" />
                        <span className="text-lg font-bold text-foreground">Lumina</span>
                    </div>
                </div>
                <ThemeToggle />
            </div>
        </motion.header>
    );
}
