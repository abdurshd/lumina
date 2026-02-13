'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/auth-store';
import { hasLocalByokApiKey } from '@/lib/byok/local-storage';
import { ErrorBoundary } from '@/components/shared';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { PageTransition } from '@/components/motion/page-transition';
import { AlertTriangle, Settings } from 'lucide-react';

const DecisionLog = dynamic(
  () => import('@/components/agent/decision-log').then((mod) => mod.DecisionLog),
  { ssr: false }
);

const MobileDecisionLog = dynamic(
  () => import('@/components/agent/decision-log').then((mod) => mod.MobileDecisionLog),
  { ssr: false }
);

const NAV_ROUTES = ['/dashboard', '/profile', '/connections', '/quiz', '/session', '/report', '/evolution', '/settings'] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [byokMissing, setByokMissing] = useState(false);
  const isByokExemptRoute = pathname === '/onboarding' || pathname === '/settings';

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

  useEffect(() => {
    if (loading || !user || !profile || isByokExemptRoute) return;

    let cancelled = false;

    const verifyByokAccess = async () => {
      const hasServerByok = Boolean(profile.byokKeyLast4) || Boolean(profile.byokPlatformAccess);
      if (hasServerByok) {
        if (!cancelled) setByokMissing(false);
        return;
      }

      const hasLocalByok = await hasLocalByokApiKey(user.uid);
      if (!cancelled) {
        setByokMissing(!hasLocalByok);
      }
    };

    void verifyByokAccess();
    return () => {
      cancelled = true;
    };
  }, [loading, user, profile, pathname, isByokExemptRoute]);

  useEffect(() => {
    if (!user) return;

    const prefetchRoutes = () => {
      for (const route of NAV_ROUTES) {
        if (route !== pathname) {
          router.prefetch(route);
        }
      }
    };

    const timeoutId = window.setTimeout(prefetchRoutes, 150);
    return () => window.clearTimeout(timeoutId);
  }, [user, pathname, router]);

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

      {/* Main content - add top padding below 1024px for mobile header */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-14 min-[1024px]:pt-0">
        {byokMissing && !isByokExemptRoute ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] min-[1024px]:min-h-screen p-6">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight">API Key Required</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You need to set your Gemini API key before using Lumina.
                  Go to Settings and enter your API key to get started.
                </p>
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Go to Settings
              </Link>
            </div>
          </div>
        ) : (
          <ErrorBoundary>
            <PageTransition>
              {children}
            </PageTransition>
          </ErrorBoundary>
        )}
      </main>

      {/* Agent decision log — desktop sidebar */}
      {isAssessmentPage && (
        <div className="hidden xl:flex">
          <DecisionLog />
        </div>
      )}

      {/* Agent decision log — mobile floating button + sheet */}
      {isAssessmentPage && <MobileDecisionLog />}
    </div>
  );
}
