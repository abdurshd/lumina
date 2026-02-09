import { StickyTopNav } from '@/components/landing/sticky-top-nav';
import { SidebarNav } from '@/components/landing/sidebar-nav';
import { HeroSection } from '@/components/landing/hero-section';
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

      <div className="relative flex flex-col">
        <div id="hero"><HeroSection /></div>
        <div id="quiz"><QuizSection /></div>
        <div id="session"><SessionSection /></div>
        <div id="report"><ReportSection /></div>
        <div id="how-it-works"><HowItWorksSection /></div>
        <CTASection />
      </div>

      {/* Footer */}
      <footer className="py-12 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <LuminaIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-black tracking-tighter text-white uppercase">Lumina</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase text-center">
            <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default"><Shield className="h-3 w-3" /> Zero Persistence</span>
            <span className="hover:text-primary transition-colors cursor-default">Powered by Gemini AI</span>
            <span className="text-white/20">&copy; 2026 Lumina Synergy</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
