'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
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
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/connections', label: 'Connections', icon: Plug },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/session', label: 'Live Session', icon: Video },
  { href: '/report', label: 'Report', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-6 py-5">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Lumina</span>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Separator />
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.photoURL} />
          <AvatarFallback>{profile?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{profile?.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
