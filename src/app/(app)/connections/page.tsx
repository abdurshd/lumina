'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveDataInsights } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import {
  useGmailMutation,
  useChatGPTMutation,
  useFileUploadMutation,
  useDriveMutation,
  useNotionMutation,
  useAnalyzeMutation,
} from '@/hooks/use-api-mutations';
import { ConnectorCard } from '@/components/connections/connector-card';
import { PageHeader, LoadingButton, ErrorAlert } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug, Mail, Upload, FileUp, HardDrive, BookOpen, ArrowRight } from 'lucide-react';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { fadeInUp, reducedMotionVariants } from '@/lib/motion';

interface DataSource {
  source: 'gmail' | 'drive' | 'notion' | 'chatgpt' | 'file_upload';
  data: string;
  tokenCount: number;
  metadata: {
    itemCount: number;
    charCount: number;
    byteSize: number;
    parseQuality: 'high' | 'medium' | 'low';
    truncated: boolean;
    truncationSummary?: string;
    warnings: string[];
  };
}

const MAX_CHATGPT_SIZE = 50 * 1024 * 1024; // 50MB
const CHATGPT_TYPES = ['application/json'];
const FILE_UPLOAD_TYPES = ['.pdf', '.txt', '.md', '.html'];

export default function ConnectionsPage() {
  const { user, profile, requestGmailAccess, requestDriveAccess, connectNotion } = useAuthStore();
  const { setDataInsights, advanceStage } = useAssessmentStore();
  const router = useRouter();

  const [dataSources, setDataSources] = useState<Record<string, DataSource>>({});
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatgptInputRef = useRef<HTMLInputElement>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  const gmailMutation = useGmailMutation();
  const chatgptMutation = useChatGPTMutation();
  const fileUploadMutation = useFileUploadMutation();
  const driveMutation = useDriveMutation();
  const notionMutation = useNotionMutation();
  const analyzeMutation = useAnalyzeMutation();

  const shouldReduceMotion = useReducedMotion();

  const connectedCount = useMemo(
    () => Object.values(dataSources).filter((d) => d.data).length,
    [dataSources]
  );

  const connectGmail = useCallback(async () => {
    setError(null);

    // Always request Gmail scope — basic sign-in doesn't include it
    const token = await requestGmailAccess();
    if (!token) {
      toast.error('Failed to get Gmail access. Please try again.');
      return;
    }

    gmailMutation.mutate({ accessToken: token }, {
      onSuccess: (result) => {
        setDataSources((prev) => ({ ...prev, gmail: result }));
        toast.success(`Gmail connected! ~${result.tokenCount.toLocaleString()} tokens collected.`);
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to connect Gmail';
        setError(message);
        toast.error(message);
      },
    });
  }, [requestGmailAccess, gmailMutation]);

  const handleChatGPTUpload = useCallback(() => {
    chatgptInputRef.current?.click();
  }, []);

  const onChatGPTFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CHATGPT_TYPES.includes(file.type) && !file.name.endsWith('.json')) {
      toast.error('Please upload a .json file (ChatGPT conversations export).');
      return;
    }
    if (file.size > MAX_CHATGPT_SIZE) {
      toast.error(`File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 50MB.`);
      return;
    }

    setError(null);
    try {
      const content = await file.text();
      try { JSON.parse(content); } catch {
        throw new Error('File is not valid JSON. Please upload your ChatGPT conversations.json export.');
      }

      chatgptMutation.mutate({ content }, {
        onSuccess: (result) => {
          setDataSources((prev) => ({ ...prev, chatgpt: result }));
          toast.success(`ChatGPT data loaded! ~${result.tokenCount.toLocaleString()} tokens collected.`);
        },
        onError: (err) => {
          const message = err instanceof FetchError ? err.message : 'Failed to process file';
          setError(message);
          toast.error(message);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process file';
      setError(message);
      toast.error(message);
    } finally {
      if (chatgptInputRef.current) chatgptInputRef.current.value = '';
    }
  }, [chatgptMutation]);

  const handleFileUpload = useCallback(() => {
    fileUploadInputRef.current?.click();
  }, []);

  const onFileUploadSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    fileUploadMutation.mutate(formData, {
      onSuccess: (result) => {
        setDataSources((prev) => ({ ...prev, file_upload: result }));
        toast.success(`File uploaded! ~${result.tokenCount.toLocaleString()} tokens collected.`);
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to upload file';
        setError(message);
        toast.error(message);
      },
    });

    if (fileUploadInputRef.current) fileUploadInputRef.current.value = '';
  }, [fileUploadMutation]);

  const connectDrive = useCallback(async () => {
    setError(null);

    // Always request Drive scope — basic sign-in doesn't include it
    const token = await requestDriveAccess();
    if (!token) {
      toast.error('Failed to get Drive access. Please try again.');
      return;
    }

    driveMutation.mutate({ accessToken: token }, {
      onSuccess: (result) => {
        setDataSources((prev) => ({ ...prev, drive: result }));
        toast.success(`Google Drive connected! ~${result.tokenCount.toLocaleString()} tokens collected.`);
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to connect Drive';
        setError(message);
        toast.error(message);
      },
    });
  }, [requestDriveAccess, driveMutation]);

  const handleConnectNotion = useCallback(() => {
    if (profile?.notionAccessToken) {
      setError(null);
      notionMutation.mutate({ accessToken: profile.notionAccessToken }, {
        onSuccess: (result) => {
          setDataSources((prev) => ({ ...prev, notion: result }));
          toast.success(`Notion connected! ~${result.tokenCount.toLocaleString()} tokens collected.`);
        },
        onError: (err) => {
          const message = err instanceof FetchError ? err.message : 'Failed to connect Notion';
          setError(message);
          toast.error(message);
        },
      });
    } else {
      connectNotion();
    }
  }, [profile?.notionAccessToken, connectNotion, notionMutation]);

  const analyzeData = useCallback(() => {
    if (connectedCount === 0 || !user) return;
    setError(null);

    const sourceData: Record<string, string> = {};
    for (const [key, source] of Object.entries(dataSources)) {
      if (source.data) sourceData[key] = source.data;
    }

    analyzeMutation.mutate({ dataSources: sourceData }, {
      onSuccess: async (analysis) => {
        const insights = analysis.insights ?? [];
        await saveDataInsights(user.uid, insights);
        setDataInsights(insights);
        await advanceStage('connections');
        setAnalysisComplete(true);
        toast.success('Analysis complete! Your data has been analyzed.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Analysis failed. Please try again.';
        setError(message);
        toast.error(message);
      },
    });
  }, [connectedCount, dataSources, user, setDataInsights, advanceStage, analyzeMutation]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        icon={Plug}
        title="Data Connections"
        description="Connect your digital footprint sources so Lumina can discover your hidden talents. Connect at least one source to proceed."
      />

      {error && <ErrorAlert message={error} onRetry={() => setError(null)} className="mb-6" />}

      <StaggerList className="space-y-4">
        <StaggerItem>
          <ConnectorCard
            title="Gmail"
            description="Analyze your sent emails to understand communication style and interests"
            icon={<Mail className="h-6 w-6" />}
            isConnected={!!dataSources.gmail?.data}
            isLoading={gmailMutation.isPending}
            onConnect={connectGmail}
            tokenCount={dataSources.gmail?.tokenCount}
            metadata={dataSources.gmail?.metadata}
          />
        </StaggerItem>

        <StaggerItem>
          <ConnectorCard
            title="ChatGPT"
            description="Upload your ChatGPT conversations.json export to analyze your thinking patterns"
            icon={<Upload className="h-6 w-6" />}
            isConnected={!!dataSources.chatgpt?.data}
            isLoading={chatgptMutation.isPending}
            onConnect={handleChatGPTUpload}
            tokenCount={dataSources.chatgpt?.tokenCount}
            metadata={dataSources.chatgpt?.metadata}
          />
        </StaggerItem>

        <StaggerItem>
          <ConnectorCard
            title="File Upload"
            description="Upload a resume, portfolio, or writing samples (PDF, TXT, Markdown, HTML)"
            icon={<FileUp className="h-6 w-6" />}
            isConnected={!!dataSources.file_upload?.data}
            isLoading={fileUploadMutation.isPending}
            onConnect={handleFileUpload}
            tokenCount={dataSources.file_upload?.tokenCount}
            metadata={dataSources.file_upload?.metadata}
          />
        </StaggerItem>

        <StaggerItem>
          <ConnectorCard
            title="Google Drive"
            description="Analyze your Google Docs to uncover writing and work patterns"
            icon={<HardDrive className="h-6 w-6" />}
            isConnected={!!dataSources.drive?.data}
            isLoading={driveMutation.isPending}
            onConnect={connectDrive}
            tokenCount={dataSources.drive?.tokenCount}
            metadata={dataSources.drive?.metadata}
          />
        </StaggerItem>

        <StaggerItem>
          <ConnectorCard
            title="Notion"
            description="Connect your Notion workspace to analyze notes, journals, and documentation"
            icon={<BookOpen className="h-6 w-6" />}
            isConnected={!!dataSources.notion?.data}
            isLoading={notionMutation.isPending}
            onConnect={handleConnectNotion}
            tokenCount={dataSources.notion?.tokenCount}
            metadata={dataSources.notion?.metadata}
          />
        </StaggerItem>

        <input
          ref={chatgptInputRef}
          type="file"
          accept=".json,application/json"
          onChange={onChatGPTFileSelected}
          className="hidden"
          aria-label="Upload ChatGPT export file"
        />
        <input
          ref={fileUploadInputRef}
          type="file"
          accept={FILE_UPLOAD_TYPES.join(',')}
          onChange={onFileUploadSelected}
          className="hidden"
          aria-label="Upload file"
        />
      </StaggerList>

      {connectedCount > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
        >
          <Card className="mt-8 glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <LuminaIcon className="h-5 w-5 text-primary" />
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
                  loading={analyzeMutation.isPending}
                  loadingText="Analyzing your data with AI..."
                  icon={LuminaIcon}
                  className="w-full"
                >
                  Analyze Data
                </LoadingButton>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
