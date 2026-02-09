'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { ErrorBoundary } from '@/components/shared';
import { Sidebar } from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent glow-amber-sm" />
          <p className="text-sm text-muted-foreground animate-fade-in">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen relative">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/[0.04] blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-secondary/[0.04] blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute -bottom-40 right-1/3 h-72 w-72 rounded-full bg-primary/[0.03] blur-3xl animate-float" style={{ animationDelay: '-5s' }} />
      </div>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
