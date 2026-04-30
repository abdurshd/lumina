import { StickyTopNav } from '@/components/landing/sticky-top-nav';
import { SidebarNav } from '@/components/landing/sidebar-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { QuizSection } from '@/components/landing/quiz-section';
import { SessionSection } from '@/components/landing/session-section';
import { ReportSection } from '@/components/landing/report-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { CTASection } from '@/components/landing/cta-section';
import { AgentLogWidget } from '@/components/landing/agent-log-widget';
import { SiteFooter } from '@/components/landing/site-footer';

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
        <div id="agent-log"><AgentLogWidget /></div>
        <div id="how-it-works"><HowItWorksSection /></div>
        <CTASection />
      </div>

      <SiteFooter />
    </main>
  );
}
