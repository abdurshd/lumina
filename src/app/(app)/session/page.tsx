'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLiveSession } from '@/hooks/use-live-session';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveSessionInsights } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import { useEphemeralTokenMutation } from '@/hooks/use-api-mutations';
import { WebcamPreview } from '@/components/session/webcam-preview';
import { TranscriptPanel } from '@/components/session/transcript-panel';
import { SessionControls } from '@/components/session/session-controls';
import { SessionTimer } from '@/components/session/session-timer';
import { AudioVisualizer } from '@/components/session/audio-visualizer';
import { PageHeader, LoadingButton, ErrorAlert } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Brain } from 'lucide-react';

export default function SessionPage() {
  const {
    isConnected,
    isConnecting,
    transcript,
    insights,
    error: sessionError,
    sessionDuration,
    webcam,
    microphone,
    connect,
    disconnect,
    sendText,
  } = useLiveSession();

  const { user } = useAuthStore();
  const { dataInsights, quizAnswers, setSessionInsights, advanceStage } = useAssessmentStore();
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const ephemeralTokenMutation = useEphemeralTokenMutation();

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
    ephemeralTokenMutation.mutate(undefined, {
      onSuccess: async ({ apiKey }) => {
        try {
          await connect(apiKey, dataContext);
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
  }, [connect, dataContext, ephemeralTokenMutation]);

  const handleDisconnect = useCallback(async () => {
    setIsSaving(true);
    try {
      disconnect();
      if (user && insights.length > 0) {
        await saveSessionInsights(user.uid, insights);
        setSessionInsights(insights);
        await advanceStage('session');
        toast.success(`Session complete! ${insights.length} insights captured.`);
      }
    } catch {
      toast.error('Failed to save session data');
    } finally {
      setIsSaving(false);
    }
  }, [disconnect, user, insights, setSessionInsights, advanceStage]);

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        icon={Sparkles}
        title="Live Session"
        description="Have a conversation with your AI career counselor"
      >
        <div className="flex items-center gap-4">
          {isConnected && <SessionTimer seconds={sessionDuration} />}
          {!isConnected && insights.length > 0 && (
            <LoadingButton onClick={handleFinish} loading={isSaving} icon={Brain}>
              View Report
            </LoadingButton>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fade-in">
        {/* Video + Controls */}
        <div className="space-y-4">
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
            <div className="text-center">
              <AudioVisualizer isActive={isConnected} />
              <p className="mt-1 text-xs text-muted-foreground font-medium">Lumina is listening...</p>
            </div>
          )}
        </div>

        {/* Transcript */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-sans">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px]">
              <TranscriptPanel entries={transcript} />
            </div>
            {isConnected && (
              <div className="border-t-2 border-white/[0.04] p-3">
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
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="mt-6 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-lg font-sans">
              <Brain className="mr-2 inline h-5 w-5" />
              Session Insights ({insights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.map((insight, i) => (
                <Badge key={i} variant="secondary" className="py-1.5">
                  <span className="font-bold mr-1">{insight.category}:</span>
                  {insight.observation.length > 60
                    ? `${insight.observation.slice(0, 60)}...`
                    : insight.observation}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
