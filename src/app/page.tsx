'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  ArrowRight,
  Plug,
  Brain,
  Video,
  FileText,
  Zap,
  Shield,
  Target,
} from 'lucide-react';

const features = [
  {
    icon: Plug,
    title: 'Digital Footprint Analysis',
    description: 'Connect Gmail and upload ChatGPT exports. Our AI finds patterns in your digital life you never noticed.',
  },
  {
    icon: Brain,
    title: 'Adaptive Intelligence Quiz',
    description: 'AI-generated questions that adapt in real-time based on your responses, probing different dimensions of talent.',
  },
  {
    icon: Video,
    title: 'Live AI Video Session',
    description: 'A real-time video conversation with an AI career counselor that observes your expressions, voice, and enthusiasm.',
  },
  {
    icon: FileText,
    title: 'Comprehensive Talent Report',
    description: 'A detailed report with radar charts, career paths, hidden talents, and a personalized action plan.',
  },
];

const howItWorks = [
  { step: '01', title: 'Connect Your Data', description: 'Link your Gmail or upload your ChatGPT conversations' },
  { step: '02', title: 'Take the Quiz', description: 'Answer AI-adaptive questions about your skills and interests' },
  { step: '03', title: 'Live Video Chat', description: 'Have a conversation with your AI career counselor' },
  { step: '04', title: 'Get Your Report', description: 'Receive a comprehensive talent discovery report' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gradient-gold font-serif">Lumina</span>
          </div>
          <Link href="/login">
            <Button className="glow-amber-sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-primary animate-fade-in-up">
          <Zap className="h-4 w-4" />
          Powered by Gemini Multimodal AI
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Discover talents you{' '}
          <span className="text-gradient-gold">
            never knew
          </span>{' '}
          you had
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Lumina uses AI to analyze your digital footprint, conduct a live video interview,
          and generate a comprehensive talent report that illuminates your hidden potential.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Link href="/login">
            <Button size="lg" className="gap-2 glow-amber">
              Start Your Discovery <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold">Four Dimensions of Discovery</h2>
          <p className="mt-2 text-muted-foreground">
            A multimodal AI pipeline that analyzes you from every angle
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <Card key={i} className="relative overflow-hidden glass hover:glow-amber-sm transition-shadow duration-500 animate-fade-in-up" style={{ animationDelay: `${400 + i * 100}ms` }}>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-sans">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-20">
        <div className="absolute inset-0 glass -z-10" />
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Four simple steps to illuminate your potential</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold glow-amber-sm font-mono text-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1 font-sans">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center relative">
        <div className="relative rounded-2xl glass-heavy p-12 glow-amber overflow-hidden">
          <Target className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Ready to discover your hidden talents?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join Lumina and let AI illuminate the potential you didn&apos;t know you had.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2 glow-amber">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium font-serif">Lumina</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Your data is never stored permanently
            </span>
            <span>Built with Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
