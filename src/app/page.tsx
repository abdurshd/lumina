import { StickyTopNav } from '@/components/landing/sticky-top-nav';
import { SidebarNav } from '@/components/landing/sidebar-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { DataAnalysisSection } from '@/components/landing/data-analysis-section';
import { QuizSection } from '@/components/landing/quiz-section';
import { SessionSection } from '@/components/landing/session-section';
import { ReportSection } from '@/components/landing/report-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { CTASection } from '@/components/landing/cta-section';

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

      {/* Footer (Simple placeholder for now) */}
      <footer className="py-8 border-t border-white/10 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Lumina Intelligence. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
