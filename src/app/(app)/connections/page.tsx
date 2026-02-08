'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useAssessment } from '@/contexts/assessment-context';
import { saveDataInsights } from '@/lib/firebase/firestore';
import { ConnectorCard } from '@/components/connections/connector-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug, Mail, Upload, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import type { DataInsight } from '@/types';

interface DataSource {
  key: string;
  data: string | null;
  tokenCount: number;
}

export default function ConnectionsPage() {
  const { user, googleAccessToken } = useAuth();
  const { setDataInsights, advanceStage } = useAssessment();
  const router = useRouter();

  const [dataSources, setDataSources] = useState<Record<string, DataSource>>({});
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const connectedCount = Object.values(dataSources).filter((d) => d.data).length;

  const connectGmail = useCallback(async () => {
    if (!googleAccessToken) return;
    setLoadingSource('gmail');
    try {
      const res = await fetch('/api/data/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: googleAccessToken }),
      });
      const { data, tokenCount } = await res.json();
      setDataSources((prev) => ({ ...prev, gmail: { key: 'gmail', data, tokenCount } }));
    } catch (err) {
      console.error('Gmail connection failed:', err);
    }
    setLoadingSource(null);
  }, [googleAccessToken]);

  const handleChatGPTUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingSource('chatgpt');
    try {
      const content = await file.text();
      const res = await fetch('/api/data/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const { data, tokenCount } = await res.json();
      setDataSources((prev) => ({ ...prev, chatgpt: { key: 'chatgpt', data, tokenCount } }));
    } catch (err) {
      console.error('ChatGPT upload failed:', err);
    }
    setLoadingSource(null);
  }, []);

  const analyzeData = useCallback(async () => {
    if (connectedCount === 0 || !user) return;
    setIsAnalyzing(true);
    try {
      const sourceData: Record<string, string> = {};
      for (const [key, source] of Object.entries(dataSources)) {
        if (source.data) sourceData[key] = source.data;
      }

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataSources: sourceData }),
      });

      const analysis = await res.json();
      const insights: DataInsight[] = analysis.insights ?? [];
      await saveDataInsights(user.uid, insights);
      setDataInsights(insights);
      await advanceStage('connections');
      setAnalysisComplete(true);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
    setIsAnalyzing(false);
  }, [connectedCount, dataSources, user, setDataInsights, advanceStage]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Plug className="h-6 w-6 text-primary" />
          Data Connections
        </h1>
        <p className="text-muted-foreground">
          Connect your digital footprint sources so Lumina can discover your hidden talents.
          Connect at least one source to proceed.
        </p>
      </div>

      <div className="space-y-4">
        <ConnectorCard
          title="Gmail"
          description="Analyze your sent emails to understand communication style and interests"
          icon={<Mail className="h-6 w-6" />}
          isConnected={!!dataSources.gmail?.data}
          isLoading={loadingSource === 'gmail'}
          onConnect={connectGmail}
          tokenCount={dataSources.gmail?.tokenCount}
        />

        <ConnectorCard
          title="ChatGPT"
          description="Upload your ChatGPT conversations.json export to analyze your thinking patterns"
          icon={<Upload className="h-6 w-6" />}
          isConnected={!!dataSources.chatgpt?.data}
          isLoading={loadingSource === 'chatgpt'}
          onConnect={handleChatGPTUpload}
          tokenCount={dataSources.chatgpt?.tokenCount}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onFileSelected}
          className="hidden"
        />
      </div>

      {connectedCount > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ready to Analyze
            </CardTitle>
            <CardDescription>
              {connectedCount} source{connectedCount > 1 ? 's' : ''} connected.
              Let Lumina analyze your data to find patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisComplete ? (
              <Button onClick={() => router.push('/quiz')} className="w-full">
                Continue to Quiz <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={analyzeData}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing your data with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Data
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
