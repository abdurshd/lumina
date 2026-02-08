'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveSession } from '@/hooks/use-live-session';
import { useAuth } from '@/contexts/auth-context';
import { useAssessment } from '@/contexts/assessment-context';
import { saveSessionInsights } from '@/lib/firebase/firestore';
import { WebcamPreview } from '@/components/session/webcam-preview';
import { TranscriptPanel } from '@/components/session/transcript-panel';
import { SessionControls } from '@/components/session/session-controls';
import { SessionTimer } from '@/components/session/session-timer';
import { AudioVisualizer } from '@/components/session/audio-visualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Brain } from 'lucide-react';

export default function SessionPage() {
  const {
    isConnected,
    isConnecting,
    transcript,
    insights,
    error,
    sessionDuration,
    webcam,
    microphone,
    connect,
    disconnect,
    sendText,
  } = useLiveSession();

  const { user, profile } = useAuth();
  const { dataInsights, quizAnswers, setSessionInsights, advanceStage } = useAssessment();
  const router = useRouter();
  const [textInput, setTextInput] = useState('');

  const handleConnect = useCallback(async () => {
    // Build context from data insights and quiz
    const dataContext = dataInsights.length > 0
      ? `Data Analysis Summary:\n${dataInsights.map((d) => `${d.source}: ${d.summary}\nSkills: ${d.skills.join(', ')}\nInterests: ${d.interests.join(', ')}`).join('\n\n')}`
      : 'No data analysis available yet.';

    const quizContext = quizAnswers.length > 0
      ? `\n\nQuiz Answers:\n${quizAnswers.map((a) => `Q${a.questionId}: ${a.answer}`).join('\n')}`
      : '';

    // Get ephemeral token
    const res = await fetch('/api/gemini/ephemeral-token', { method: 'POST' });
    const { apiKey } = await res.json();

    await connect(apiKey, dataContext + quizContext);
  }, [connect, dataInsights, quizAnswers]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    if (user && insights.length > 0) {
      await saveSessionInsights(user.uid, insights);
      setSessionInsights(insights);
      await advanceStage('session');
    }
  }, [disconnect, user, insights, setSessionInsights, advanceStage]);

  const handleSendText = useCallback(() => {
    if (!textInput.trim()) return;
    sendText(textInput);
    setTextInput('');
  }, [textInput, sendText]);

  const handleFinish = async () => {
    if (isConnected) {
      await handleDisconnect();
    }
    router.push('/report');
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            Live Session
          </h1>
          <p className="text-muted-foreground">
            Have a conversation with your AI career counselor
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && <SessionTimer seconds={sessionDuration} />}
          {!isConnected && insights.length > 0 && (
            <Button onClick={handleFinish}>
              View Report <Brain className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
              <p className="mt-1 text-xs text-muted-foreground">Lumina is listening...</p>
            </div>
          )}
        </div>

        {/* Transcript */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px]">
              <TranscriptPanel entries={transcript} />
            </div>
            {isConnected && (
              <div className="border-t p-3">
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
                  />
                  <Button type="submit" size="icon">
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
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">
              <Brain className="mr-2 inline h-5 w-5" />
              Session Insights ({insights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.map((insight, i) => (
                <Badge key={i} variant="secondary" className="py-1">
                  {insight.category}: {insight.observation.slice(0, 60)}...
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
