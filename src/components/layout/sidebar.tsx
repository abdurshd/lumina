'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  LayoutDashboard,
  Plug,
  Brain,
  Video,
  FileText,
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
import { ThemeToggle } from '@/components/layout/theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/connections', label: 'Connections', icon: Plug },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/session', label: 'Live Session', icon: Video },
  { href: '/report', label: 'Report', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r-2 border-overlay-subtle">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <LuminaIcon className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-gradient-gold">Lumina</span>
      </div>
      <div className="h-[2px] bg-overlay-subtle" />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 animate-fade-in-up',
                isActive
                  ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-[0_2px_0_oklch(70.4%_0.14_182.503/0.1)]'
                  : 'text-muted-foreground hover:bg-overlay-subtle hover:text-foreground border-2 border-transparent'
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="h-[2px] bg-overlay-subtle" />
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="h-9 w-9 border-2 border-overlay-medium">
          <AvatarImage src={profile?.photoURL} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{profile?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
        </Avatar>
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
    </aside>
  );
}
