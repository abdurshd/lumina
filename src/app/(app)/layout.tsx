'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { ErrorBoundary } from '@/components/shared';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { PageTransition } from '@/components/motion/page-transition';
import { DecisionLog } from '@/components/agent/decision-log';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && profile && !profile.consentGiven && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [loading, profile, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Don't show sidebar on onboarding
  if (pathname === '/onboarding') {
    return (
      <div className="min-h-screen">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    );
  }

  // Assessment pages where agent panel should appear
  const isAssessmentPage = ['/connections', '/quiz', '/session', '/report', '/dashboard'].includes(pathname);

  return (
    <div className="flex h-screen relative">
      {/* Mobile header */}
      <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Mobile sidebar (Sheet) */}
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content - add top padding on mobile for header */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-14 lg:pt-0">
        <ErrorBoundary>
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </ErrorBoundary>
      </main>

      {/* Agent decision log — visible on assessment pages (desktop only) */}
      {isAssessmentPage && (
        <div className="hidden xl:flex">
          <DecisionLog />
        </div>
      )}
    </div>
  );
}
