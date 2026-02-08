'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useAssessment } from '@/contexts/assessment-context';
import { saveDataInsights } from '@/lib/firebase/firestore';
import { apiFetch, FetchError } from '@/lib/fetch-client';
import { ConnectorCard } from '@/components/connections/connector-card';
import { PageHeader, LoadingButton, ErrorAlert } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug, Mail, Upload, ArrowRight, Sparkles } from 'lucide-react';
import type { DataInsight } from '@/types';

interface DataSource {
  data: string;
  tokenCount: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = ['application/json'];

export default function ConnectionsPage() {
  const { user, googleAccessToken } = useAuth();
  const { setDataInsights, advanceStage } = useAssessment();
  const router = useRouter();

  const [dataSources, setDataSources] = useState<Record<string, DataSource>>({});
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const connectedCount = useMemo(
    () => Object.values(dataSources).filter((d) => d.data).length,
    [dataSources]
  );

  const connectGmail = useCallback(async () => {
    if (!googleAccessToken) {
      toast.error('Google access token not available. Please sign out and sign in again.');
      return;
    }
    setLoadingSource('gmail');
    setError(null);
    try {
      const result = await apiFetch<{ data: string; tokenCount: number }>('/api/data/gmail', {
        method: 'POST',
        body: JSON.stringify({ accessToken: googleAccessToken }),
      });
      setDataSources((prev) => ({ ...prev, gmail: result }));
      toast.success(`Gmail connected! ~${result.tokenCount.toLocaleString()} tokens collected.`);
    } catch (err) {
      const message = err instanceof FetchError ? err.message : 'Failed to connect Gmail';
      setError(message);
      toast.error(message);
    } finally {
      setLoadingSource(null);
    }
  }, [googleAccessToken]);

  const handleChatGPTUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.json')) {
      toast.error('Please upload a .json file (ChatGPT conversations export).');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 50MB.`);
      return;
    }

    setLoadingSource('chatgpt');
    setError(null);
    try {
      const content = await file.text();

      // Quick validate it's valid JSON
      try {
        JSON.parse(content);
      } catch {
        throw new Error('File is not valid JSON. Please upload your ChatGPT conversations.json export.');
      }

      const result = await apiFetch<{ data: string; tokenCount: number }>('/api/data/chatgpt', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setDataSources((prev) => ({ ...prev, chatgpt: result }));
      toast.success(`ChatGPT data loaded! ~${result.tokenCount.toLocaleString()} tokens collected.`);
    } catch (err) {
      const message = err instanceof FetchError ? err.message : err instanceof Error ? err.message : 'Failed to process file';
      setError(message);
      toast.error(message);
    } finally {
      setLoadingSource(null);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const analyzeData = useCallback(async () => {
    if (connectedCount === 0 || !user) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const sourceData: Record<string, string> = {};
      for (const [key, source] of Object.entries(dataSources)) {
        if (source.data) sourceData[key] = source.data;
      }

      const analysis = await apiFetch<{ insights: DataInsight[] }>('/api/gemini/analyze', {
        method: 'POST',
        body: JSON.stringify({ dataSources: sourceData }),
      });

      const insights = analysis.insights ?? [];
      await saveDataInsights(user.uid, insights);
      setDataInsights(insights);
      await advanceStage('connections');
      setAnalysisComplete(true);
      toast.success('Analysis complete! Your data has been analyzed.');
    } catch (err) {
      const message = err instanceof FetchError ? err.message : 'Analysis failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [connectedCount, dataSources, user, setDataInsights, advanceStage]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        icon={Plug}
        title="Data Connections"
        description="Connect your digital footprint sources so Lumina can discover your hidden talents. Connect at least one source to proceed."
      />

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} className="mb-6" />}

      <div className="space-y-4">
        <ConnectorCard
          title="Gmail"
          description="Analyze your sent emails to understand communication style and interests"
          icon={<Mail className="h-6 w-6" />}
          isConnected={!!dataSources.gmail?.data}
          isLoading={loadingSource === 'gmail'}
          onConnect={connectGmail}
          tokenCount={dataSources.gmail?.tokenCount}
          disabled={!googleAccessToken}
          disabledReason={!googleAccessToken ? 'Sign in with Google to connect Gmail' : undefined}
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
          accept=".json,application/json"
          onChange={onFileSelected}
          className="hidden"
          aria-label="Upload ChatGPT export file"
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
              <LoadingButton
                onClick={() => router.push('/quiz')}
                icon={ArrowRight}
                className="w-full"
              >
                Continue to Quiz
              </LoadingButton>
            ) : (
              <LoadingButton
                onClick={analyzeData}
                loading={isAnalyzing}
                loadingText="Analyzing your data with AI..."
                icon={Sparkles}
                className="w-full"
              >
                Analyze Data
              </LoadingButton>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
