'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLiveSession } from '@/hooks/use-live-session';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveSessionInsights, saveUserSignals } from '@/lib/firebase/firestore';
import { summarizeLiveSessionArtifacts } from '@/lib/session/post-session-summary';
import { FetchError } from '@/lib/fetch-client';
import { useEphemeralTokenMutation } from '@/hooks/use-api-mutations';
import { WebcamPreview } from '@/components/session/webcam-preview';
import { TranscriptPanel } from '@/components/session/transcript-panel';
import { SessionControls } from '@/components/session/session-controls';
import { SessionTimer } from '@/components/session/session-timer';
import { AudioVisualizer } from '@/components/session/audio-visualizer';
import { BehavioralTimelineView } from '@/components/session/behavioral-timeline';
import { PageHeader, LoadingButton, ErrorAlert } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Send, Brain } from 'lucide-react';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  fadeInDown,
  popIn,
  reducedMotionVariants,
} from '@/lib/motion';

export default function SessionPage() {
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    reconnectAttempt,
    transcript,
    insights,
    signals,
    behaviorCaptureEnabled,
    suggestedModule,
    nextSteps,
    trends,
    correlations,
    timelineSnapshots,
    timelineNarrative,
    dismissSuggestedModule,
    error: sessionError,
    sessionDuration,
    webcam,
    microphone,
    connect,
    disconnect,
    sendText,
    toggleBehaviorCapture,
    toggleCamera,
    toggleMicrophone,
  } = useLiveSession();

  const { user, profile } = useAuthStore();
  const { dataInsights, quizAnswers, setSessionInsights, advanceStage } = useAssessmentStore();
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const ephemeralTokenMutation = useEphemeralTokenMutation();
  const shouldReduceMotion = useReducedMotion();

  const dataContext = useMemo(() => {
    const data = dataInsights.length > 0
      ? `Data Analysis Summary:\n${dataInsights.map((d) => `${d.source}: ${d.summary}\nSkills: ${d.skills.join(', ')}\nInterests: ${d.interests.join(', ')}`).join('\n\n')}`
      : 'No data analysis available yet.';

    const quiz = quizAnswers.length > 0
      ? `\n\nQuiz Answers:\n${quizAnswers.map((a) => `Q${a.questionId}: ${a.answer}`).join('\n')}`
      : '';

    return data + quiz;
  }, [dataInsights, quizAnswers]);

  const handleConnect = useCallback(() => {
    setError(null);
    if (!profile?.ageGateConfirmed || !profile?.videoBehaviorConsent) {
      const message = 'Please complete onboarding consent (age + behavioral video consent) before starting a live session.';
      setError(message);
      toast.error(message);
      router.push('/onboarding');
      return;
    }
    ephemeralTokenMutation.mutate(undefined, {
      onSuccess: async ({ token, apiVersion, model }) => {
        try {
          await connect(token, dataContext, apiVersion, undefined, model);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to start session';
          setError(message);
          toast.error(message);
        }
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to start session';
        setError(message);
        toast.error(message);
      },
    });
  }, [connect, dataContext, ephemeralTokenMutation, profile, router]);

  const handleDisconnect = useCallback(async () => {
    setIsSaving(true);
    try {
      disconnect();
      if (user && (insights.length > 0 || signals.length > 0)) {
        const summarized = summarizeLiveSessionArtifacts({ insights, signals });
        await saveSessionInsights(user.uid, summarized.insights);
        await saveUserSignals(user.uid, summarized.signals);
        setSessionInsights(summarized.insights);
        await advanceStage('session');
        toast.success(`Session complete! ${summarized.insights.length} insights captured.`);
      }
    } catch {
      toast.error('Failed to save session data');
    } finally {
      setIsSaving(false);
    }
  }, [disconnect, user, insights, signals, setSessionInsights, advanceStage]);

  const handleSendText = useCallback(() => {
    if (!textInput.trim()) return;
    sendText(textInput);
    setTextInput('');
  }, [textInput, sendText]);

  const handleFinish = useCallback(async () => {
    if (isConnected) {
      await handleDisconnect();
    }
    router.push('/report');
  }, [isConnected, handleDisconnect, router]);

  const displayError = error || sessionError;

  // Motion variants
  const gridVariants = shouldReduceMotion ? reducedMotionVariants : staggerContainer;
  const itemVariants = shouldReduceMotion ? reducedMotionVariants : staggerItem;
  const fadeUpVariants = shouldReduceMotion ? reducedMotionVariants : fadeInUp;
  const fadeDownVariants = shouldReduceMotion ? reducedMotionVariants : fadeInDown;
  const popVariants = shouldReduceMotion ? reducedMotionVariants : popIn;

  // Pulse animation for View Report button area
  const pulseVariants = shouldReduceMotion
    ? {}
    : {
        scale: [1, 1.02, 1],
        transition: {
          type: 'tween' as const,
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        icon={LuminaIcon}
        title="Live Session"
        description="Have a conversation with your AI career counselor"
      >
        <div className="flex items-center gap-4">
          {isConnected && <SessionTimer seconds={sessionDuration} />}
          {!isConnected && insights.length > 0 && (
            <motion.div animate={pulseVariants}>
              <LoadingButton onClick={handleFinish} loading={isSaving} icon={Brain}>
                View Report
              </LoadingButton>
            </motion.div>
          )}
        </div>
      </PageHeader>

      {displayError && (
        <ErrorAlert
          message={displayError}
          onRetry={() => setError(null)}
          className="mb-6"
        />
      )}

      {isConnected && !behaviorCaptureEnabled && (
        <div className="mb-6 rounded-xl border-2 border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600">
          Behavioral capture is paused. Conversation continues, but no new behavioral insights/signals are stored.
        </div>
      )}

      {/* Reconnecting Banner */}
      <AnimatePresence>
        {isReconnecting && (
          <motion.div
            variants={fadeDownVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="mb-6 flex items-center gap-3 rounded-xl border-2 border-yellow-500/30 bg-yellow-500/5 p-4"
          >
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
            <p className="text-sm font-medium text-yellow-500">
              Reconnecting (attempt {reconnectAttempt}/3)...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Module Suggestion */}
      <AnimatePresence>
        {suggestedModule && (
          <motion.div
            variants={fadeDownVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
          >
            <Card className="mb-6 border-primary/30">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Lumina suggests: Take the {suggestedModule.moduleId.replace(/_/g, ' ')} quiz</p>
                    <p className="text-xs text-muted-foreground">{suggestedModule.reason}</p>
                    <div className="flex items-center gap-2 mt-3 sm:mt-2">
                      <Button size="sm" variant="outline" onClick={dismissSuggestedModule}>
                        Dismiss
                      </Button>
                      <Button size="sm" onClick={() => router.push(`/quiz?module=${suggestedModule.moduleId}`)}>
                        Take Quiz
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid with Stagger */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Video + Controls */}
        <motion.div variants={itemVariants} className="space-y-4">
          <WebcamPreview videoRef={webcam.videoRef} isActive={webcam.isActive} />
          <div className="flex justify-center">
            <SessionControls
              isConnected={isConnected}
              isConnecting={isConnecting}
              isMicActive={microphone.isActive}
              isCamActive={webcam.isActive}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </div>
          {isConnected && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" variant="outline" onClick={toggleMicrophone}>
                {microphone.isActive ? 'Mute Mic' : 'Unmute Mic'}
              </Button>
              <Button size="sm" variant="outline" onClick={toggleCamera}>
                {webcam.isActive ? 'Disable Camera' : 'Enable Camera'}
              </Button>
              <Button
                size="sm"
                variant={behaviorCaptureEnabled ? 'default' : 'secondary'}
                onClick={toggleBehaviorCapture}
              >
                {behaviorCaptureEnabled ? 'Pause Behavioral Capture' : 'Resume Behavioral Capture'}
              </Button>
            </div>
          )}
          {isConnected && (
            <div className="text-center">
              <AudioVisualizer isActive={isConnected} />
              <p className="mt-1 text-xs text-muted-foreground font-medium">Lumina is listening...</p>
            </div>
          )}
        </motion.div>

        {/* Transcript */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-sans">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[280px] sm:h-[400px]">
                <TranscriptPanel entries={transcript} />
              </div>
              {isConnected && (
                <div className="border-t-2 border-overlay-subtle p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendText();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type a message (or just speak)..."
                      aria-label="Chat message input"
                    />
                    <Button type="submit" size="icon" disabled={!textInput.trim()} aria-label="Send message">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Insights with Stagger Badges */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
          >
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-sans">
                  <Brain className="mr-2 inline h-5 w-5" />
                  Session Insights ({insights.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={shouldReduceMotion ? {} : staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-2"
                >
                  {insights.map((insight, i) => (
                    <motion.div key={i} variants={popVariants}>
                      <Badge variant="secondary" className="py-1.5">
                        <span className="font-bold mr-1">{insight.category}:</span>
                        {insight.observation.length > 60
                          ? `${insight.observation.slice(0, 60)}...`
                          : insight.observation}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Behavioral Timeline */}
      <BehavioralTimelineView
        trends={trends}
        correlations={correlations}
        snapshots={timelineSnapshots}
        narrative={timelineNarrative}
      />

      {/* Next Steps with Stagger */}
      <AnimatePresence>
        {nextSteps.length > 0 && (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
          >
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-sans">
                  Next Steps ({nextSteps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={shouldReduceMotion ? {} : staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {nextSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">{step.timeframe}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
