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
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { smoothTransition, staggerContainer, staggerItem, popIn, reducedMotionVariants, heavySpring, snappySpring } from '@/lib/motion';

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
  const [direction, setDirection] = useState(1);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const goToStep = useCallback((newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  }, [step]);

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

  // Slide variants based on direction
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: smoothTransition,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  const effectiveVariants = shouldReduceMotion ? reducedMotionVariants : undefined;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Step progress indicator */}
      <div className="flex justify-center gap-3 mb-8">
        {[0, 1, 2].map((s) => (
          <div key={s} className="relative h-2 w-8 rounded-full bg-overlay-light">
            {step === s && (
              <motion.div
                layoutId="onboarding-step"
                className="absolute inset-0 rounded-full bg-primary"
                transition={shouldReduceMotion ? { duration: 0 } : heavySpring}
              />
            )}
            {step > s && (
              <div className="absolute inset-0 rounded-full bg-primary/50" />
            )}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <motion.div
            key="step-0"
            custom={direction}
            variants={shouldReduceMotion ? reducedMotionVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                variants={effectiveVariants || popIn}
                initial="hidden"
                animate="visible"
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20"
              >
                <LuminaIcon className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            <motion.h1
              variants={effectiveVariants || staggerItem}
              initial="hidden"
              animate="visible"
              className="text-3xl font-bold mb-3"
            >
              Welcome to Lumina
            </motion.h1>
            <motion.p
              variants={effectiveVariants || staggerItem}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
            >
              Lumina helps you discover your hidden talents through AI-powered analysis of your digital footprint, an adaptive quiz, and a live conversation.
            </motion.p>

            <motion.div
              variants={effectiveVariants || staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <Card className="text-left mb-8">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <motion.div variants={effectiveVariants || staggerItem} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 shrink-0">01</Badge>
                      <div>
                        <p className="font-medium">Connect your data</p>
                        <p className="text-sm text-muted-foreground">Link Gmail, ChatGPT exports, files, Drive, or Notion</p>
                      </div>
                    </motion.div>
                    <motion.div variants={effectiveVariants || staggerItem} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 shrink-0">02</Badge>
                      <div>
                        <p className="font-medium">Take the talent quiz</p>
                        <p className="text-sm text-muted-foreground">15 adaptive questions covering interests, values, and style</p>
                      </div>
                    </motion.div>
                    <motion.div variants={effectiveVariants || staggerItem} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 shrink-0">03</Badge>
                      <div>
                        <p className="font-medium">Have a live conversation</p>
                        <p className="text-sm text-muted-foreground">Video chat with your AI career counselor</p>
                      </div>
                    </motion.div>
                    <motion.div variants={effectiveVariants || staggerItem} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 shrink-0">04</Badge>
                      <div>
                        <p className="font-medium">Get your report</p>
                        <p className="text-sm text-muted-foreground">Personalized talent analysis with career recommendations</p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={() => goToStep(1)}
                asChild
              >
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  transition={smoothTransition}
                >
                  Get Started
                  <motion.span
                    className="ml-2 inline-block"
                    whileHover={shouldReduceMotion ? {} : { x: 3 }}
                    transition={smoothTransition}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.button>
              </Button>
            </motion.div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            custom={direction}
            variants={shouldReduceMotion ? reducedMotionVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Data & Privacy</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Choose which data sources you&apos;re comfortable connecting. You can change this later in Settings.
            </p>

            <motion.div
              variants={effectiveVariants || staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={effectiveVariants || staggerItem}>
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
              </motion.div>

              <motion.div variants={effectiveVariants || staggerItem}>
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
              </motion.div>

              <motion.div variants={effectiveVariants || staggerItem}>
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
              </motion.div>

              <motion.div variants={effectiveVariants || staggerItem}>
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
              </motion.div>

              <motion.div variants={effectiveVariants || staggerItem}>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-lg font-sans">Select data sources to consent to:</CardTitle>
                    <CardDescription>You can connect specific sources later — this just sets your preferences.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {DATA_SOURCE_OPTIONS.map((source) => (
                        <label key={source.id} className="flex items-center gap-3 cursor-pointer">
                          <motion.div
                            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                            animate={
                              selectedSources.includes(source.id) && !shouldReduceMotion
                                ? { scale: [1, 1.15, 1] }
                                : undefined
                            }
                            transition={snappySpring}
                          >
                            <Checkbox
                              checked={selectedSources.includes(source.id)}
                              onCheckedChange={() => toggleSource(source.id)}
                            />
                          </motion.div>
                          <div>
                            <p className="text-sm font-medium">{source.label}</p>
                            <p className="text-xs text-muted-foreground">{source.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => goToStep(0)} asChild>
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  transition={smoothTransition}
                >
                  <motion.span
                    className="mr-2 inline-block"
                    whileHover={shouldReduceMotion ? {} : { x: -3 }}
                    transition={smoothTransition}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.span>
                  Back
                </motion.button>
              </Button>
              <Button onClick={() => goToStep(2)} asChild>
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  transition={smoothTransition}
                >
                  Continue
                  <motion.span
                    className="ml-2 inline-block"
                    whileHover={shouldReduceMotion ? {} : { x: 3 }}
                    transition={smoothTransition}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.button>
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            custom={direction}
            variants={shouldReduceMotion ? reducedMotionVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                variants={effectiveVariants || popIn}
                initial="hidden"
                animate="visible"
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20"
              >
                <Shield className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            <motion.h2
              variants={effectiveVariants || staggerItem}
              initial="hidden"
              animate="visible"
              className="text-2xl font-bold mb-3"
            >
              Confirm Your Consent
            </motion.h2>
            <motion.p
              variants={effectiveVariants || staggerItem}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-6 max-w-md mx-auto"
            >
              By continuing, you agree to let Lumina analyze your selected data sources to generate personalized talent insights.
            </motion.p>

            {selectedSources.length > 0 && (
              <motion.div
                variants={effectiveVariants || staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap justify-center gap-2 mb-6"
              >
                {selectedSources.map((s) => {
                  const source = DATA_SOURCE_OPTIONS.find((opt) => opt.id === s);
                  return (
                    <motion.span
                      key={s}
                      variants={effectiveVariants || popIn}
                    >
                      <Badge variant="secondary">{source?.label ?? s}</Badge>
                    </motion.span>
                  );
                })}
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-muted-foreground mb-8"
            >
              You can delete all your data at any time from Settings. Your data is stored securely in Firebase and only used for your talent assessment.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3"
            >
              <Button variant="outline" onClick={() => goToStep(1)} asChild>
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  transition={smoothTransition}
                >
                  <motion.span
                    className="mr-2 inline-block"
                    whileHover={shouldReduceMotion ? {} : { x: -3 }}
                    transition={smoothTransition}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.span>
                  Back
                </motion.button>
              </Button>
              <Button size="lg" onClick={handleConsent} disabled={isSaving} asChild>
                <motion.button
                  whileHover={shouldReduceMotion || isSaving ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion || isSaving ? {} : { scale: 0.98 }}
                  transition={smoothTransition}
                >
                  {isSaving ? 'Saving...' : 'I Agree — Let\'s Go'}
                  <motion.span
                    className="ml-2 inline-block"
                    whileHover={shouldReduceMotion || isSaving ? {} : { x: 3 }}
                    transition={smoothTransition}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.button>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
