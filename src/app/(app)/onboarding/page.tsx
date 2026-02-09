'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { ArrowRight, ArrowLeft, Shield, Sparkles } from 'lucide-react';

const DATA_SOURCE_OPTIONS = [
  { id: 'gmail', label: 'Gmail', description: 'Analyze sent emails for communication patterns' },
  { id: 'chatgpt', label: 'ChatGPT Export', description: 'Analyze conversation patterns and interests' },
  { id: 'file_upload', label: 'File Uploads', description: 'Upload resumes, portfolios, writing samples' },
  { id: 'drive', label: 'Google Drive', description: 'Analyze Google Docs for work patterns' },
  { id: 'notion', label: 'Notion', description: 'Analyze notes and documentation' },
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSource = useCallback((sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((s) => s !== sourceId)
        : [...prev, sourceId]
    );
  }, []);

  const handleConsent = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        consentGiven: true,
        consentTimestamp: Date.now(),
        consentSources: selectedSources,
        consentVersion: 1,
      });
      await refreshProfile();
      toast.success('Welcome to Lumina!');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save consent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [user, selectedSources, refreshProfile, router]);

  if (step === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20">
              <LuminaIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome to Lumina</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Lumina helps you discover your hidden talents through AI-powered analysis of your digital footprint, an adaptive quiz, and a live conversation.
          </p>

          <Card className="text-left mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">01</Badge>
                  <div>
                    <p className="font-medium">Connect your data</p>
                    <p className="text-sm text-muted-foreground">Link Gmail, ChatGPT exports, files, Drive, or Notion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">02</Badge>
                  <div>
                    <p className="font-medium">Take the talent quiz</p>
                    <p className="text-sm text-muted-foreground">15 adaptive questions covering interests, values, and style</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">03</Badge>
                  <div>
                    <p className="font-medium">Have a live conversation</p>
                    <p className="text-sm text-muted-foreground">Video chat with your AI career counselor</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">04</Badge>
                  <div>
                    <p className="font-medium">Get your report</p>
                    <p className="text-sm text-muted-foreground">Personalized talent analysis with career recommendations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" onClick={() => setStep(1)}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Data & Privacy</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Choose which data sources you&apos;re comfortable connecting. You can change this later in Settings.
          </p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-sans">What Lumina will do:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Analyze patterns in your communication, interests, and work style
              </p>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Identify strengths and talent dimensions you might not recognize
              </p>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Recommend career paths grounded in evidence from your data
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-sans">What Lumina will NOT do:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">- Never share your data with third parties</p>
              <p className="text-sm text-muted-foreground">- Never store raw email or document content permanently</p>
              <p className="text-sm text-muted-foreground">- Never make decisions or take actions on your behalf</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-sans">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>What IS stored:</strong> AI-generated insights, quiz scores, talent signals, and your report. These are structured summaries, not raw data.</span>
              </p>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>What is NOT stored:</strong> Raw email content, document text, or chat exports. These are processed in-memory and discarded after analysis.</span>
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-sans">Video Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Your camera is used for conversation context only — Lumina observes body language and engagement to understand you better.
              </p>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                No biometric inference, facial recognition, or video recording. Video frames are processed in real-time and never stored.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-sans">Select data sources to consent to:</CardTitle>
              <CardDescription>You can connect specific sources later — this just sets your preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DATA_SOURCE_OPTIONS.map((source) => (
                  <label key={source.id} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={() => toggleSource(source.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{source.label}</p>
                      <p className="text-xs text-muted-foreground">{source.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(2)}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3">Confirm Your Consent</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          By continuing, you agree to let Lumina analyze your selected data sources to generate personalized talent insights.
        </p>

        {selectedSources.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {selectedSources.map((s) => {
              const source = DATA_SOURCE_OPTIONS.find((opt) => opt.id === s);
              return (
                <Badge key={s} variant="secondary">{source?.label ?? s}</Badge>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-8">
          You can delete all your data at any time from Settings. Your data is stored securely in Firebase and only used for your talent assessment.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button size="lg" onClick={handleConsent} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'I Agree — Let\'s Go'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
