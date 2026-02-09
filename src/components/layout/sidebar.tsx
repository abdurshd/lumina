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
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-white/[0.04]">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-gradient-gold">Lumina</span>
      </div>
      <div className="h-px bg-white/[0.04]" />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 animate-fade-in-up',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="h-px bg-white/[0.04]" />
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="h-8 w-8 border border-white/[0.1]">
          <AvatarImage src={profile?.photoURL} />
          <AvatarFallback className="bg-white/[0.06] text-foreground text-xs">{profile?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{profile?.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
