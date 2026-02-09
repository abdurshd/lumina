import { StickyTopNav } from '@/components/landing/sticky-top-nav';
import { SidebarNav } from '@/components/landing/sidebar-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { DataAnalysisSection } from '@/components/landing/data-analysis-section';
import { QuizSection } from '@/components/landing/quiz-section';
import { SessionSection } from '@/components/landing/session-section';
import { ReportSection } from '@/components/landing/report-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { CTASection } from '@/components/landing/cta-section';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <StickyTopNav />

      {/* Sidebar Nav (Desktop Only) */}
      <div className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-40">
        <SidebarNav />
      </div>

      <div className="flex flex-col">
        <HeroSection />
        <DataAnalysisSection />
        <QuizSection />
        <SessionSection />
        <ReportSection />
        <HowItWorksSection />
        <CTASection />
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-overlay-subtle py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LuminaIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">Lumina</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Privacy-first</span>
            <span>Built with Gemini AI</span>
            <span>&copy; 2025 Lumina</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
