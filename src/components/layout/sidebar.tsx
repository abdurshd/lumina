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
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/connections', label: 'Connections', icon: Plug },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/session', label: 'Live Session', icon: Video },
  { href: '/report', label: 'Report', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r-2 border-overlay-subtle">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <Sparkles className="h-6 w-6 text-primary" />
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
                  ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-[0_2px_0_rgba(88,204,2,0.1)]'
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
        <Button variant="ghost" size="icon-sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
