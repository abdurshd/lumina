'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { staggerContainer, staggerItem, smoothTransition, hoverRotateIcon, morphTransition } from '@/lib/motion';
import {
  LayoutDashboard,
  Plug,
  Brain,
  Video,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
} from 'lucide-react';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/connections', label: 'Connections', icon: Plug },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/session', label: 'Live Session', icon: Video },
  { href: '/report', label: 'Report', icon: FileText },
  { href: '/evolution', label: 'Evolution', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarContentProps {
  onNavClick?: () => void;
}

function SidebarContent({ onNavClick }: SidebarContentProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center gap-2.5 px-6 py-5">
        <LuminaIcon className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-foreground">Lumina</span>
      </div>
      <div className="h-[2px] bg-overlay-subtle" />
      <motion.nav
        className="flex-1 space-y-1 px-3 py-4"
        initial="hidden"
        animate="visible"
        variants={shouldReduceMotion ? undefined : staggerContainer}
        onMouseLeave={() => setHoveredHref(null)}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.div key={item.href} variants={shouldReduceMotion ? undefined : staggerItem}>
              <Link
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-[0_2px_0_oklch(70.4%_0.14_182.503/0.1)]'
                    : 'text-muted-foreground hover:text-foreground border-2 border-transparent'
                )}
                onMouseEnter={() => setHoveredHref(item.href)}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary"
                    transition={smoothTransition}
                  />
                )}
                <AnimatePresence>
                  {!isActive && hoveredHref === item.href && !shouldReduceMotion && (
                    <motion.div
                      layoutId="sidebar-hover"
                      className="absolute inset-0 rounded-xl bg-overlay-subtle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={morphTransition}
                    />
                  )}
                </AnimatePresence>
                <motion.span
                  className="relative z-10"
                  whileHover={shouldReduceMotion ? undefined : hoverRotateIcon.whileHover}
                  transition={hoverRotateIcon.transition}
                >
                  <item.icon className="h-4 w-4" />
                </motion.span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>
      <div className="h-[2px] bg-overlay-subtle" />
      <div className="flex items-center gap-3 px-4 py-4">
        <motion.div whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }} transition={smoothTransition}>
          <Avatar className="h-9 w-9 border-2 border-overlay-medium">
            <AvatarImage src={profile?.photoURL} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{profile?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold">{profile?.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
        </div>
        <ThemeToggle />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;ll need to sign in again to access your account and assessment data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={signOut}>Sign out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

// Desktop sidebar - static
export function Sidebar() {
  return (
    <aside className="hidden lg:flex h-full w-64 flex-col bg-sidebar border-r-2 border-overlay-subtle">
      <SidebarContent />
    </aside>
  );
}

// Mobile sidebar - slide-in sheet
interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-64 p-0 border-r-2 border-overlay-subtle bg-sidebar"
        showCloseButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar navigation</SheetTitle>
          <SheetDescription>
            Main application navigation and account controls.
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <SidebarContent onNavClick={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
