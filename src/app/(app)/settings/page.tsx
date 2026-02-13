'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { useDeleteDataMutation, useUpdateProfileMutation, useDeleteCorpusDocMutation } from '@/hooks/use-api-mutations';
import { useCorpusDocumentsQuery } from '@/hooks/use-api-queries';
import { disconnectNotion } from '@/lib/firebase/firestore';
import { FetchError, apiFetch } from '@/lib/fetch-client';
import { apiClient } from '@/lib/api/client';
import { clearLocalByokApiKey, hasLocalByokApiKey, setLocalByokApiKey } from '@/lib/byok/local-storage';
import { PageHeader, LoadingButton } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, Database, Shield, ChevronRight, Link2Off, Download, FileSearch, Bell, Sun, Moon, AlertTriangle } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { staggerContainer, staggerItem, reducedMotionVariants, collapseExpand, snappySpring } from '@/lib/motion';

const DATA_SOURCES = [
  { key: 'dataInsights', label: 'Data Analysis', description: 'Gmail, ChatGPT, Drive, Notion analysis results' },
  { key: 'quizAnswers', label: 'Quiz Answers', description: 'Your quiz responses' },
  { key: 'quizScores', label: 'Quiz Scores', description: 'Dimension scores from quiz' },
  { key: 'sessionInsights', label: 'Session Insights', description: 'AI observations from live session' },
  { key: 'signals', label: 'Talent Signals', description: 'Atomic talent signals detected' },
  { key: 'talentReport', label: 'Talent Report', description: 'Your generated talent report' },
  { key: 'feedback', label: 'Feedback', description: 'Your agree/disagree feedback on recommendations' },
];

const CONSENT_SOURCE_OPTIONS = [
  { id: 'gmail', label: 'Gmail' },
  { id: 'chatgpt', label: 'ChatGPT Export' },
  { id: 'gemini_app', label: 'Gemini Conversations' },
  { id: 'claude_app', label: 'Claude Conversations' },
  { id: 'file_upload', label: 'File Uploads' },
  { id: 'drive', label: 'Google Drive' },
  { id: 'notion', label: 'Notion' },
];

const NOTIFICATION_OPTIONS = [
  { id: 'challenge_reminders', label: 'Challenge reminders' },
  { id: 'profile_updates', label: 'Profile updates' },
  { id: 'weekly_digest', label: 'Weekly digest' },
];

export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuthStore();
  const { reset: resetAssessment } = useAssessmentStore();
  const deleteDataMutation = useDeleteDataMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteCorpusDocMutation = useDeleteCorpusDocMutation();
  const shouldReduceMotion = useReducedMotion();
  const { theme, setTheme } = useTheme();

  const corpusDocsQuery = useCorpusDocumentsQuery(user?.uid);

  const [showDataSection, setShowDataSection] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [consentSources, setConsentSources] = useState<string[]>(profile?.consentSources ?? []);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingCorpus, setIsDeletingCorpus] = useState(false);
  const [, setByokEnabled] = useState(profile?.byokEnabled ?? false);
  const [byokKeyInput, setByokKeyInput] = useState('');
  const [byokKeyLast4, setByokKeyLast4] = useState<string | null>(profile?.byokKeyLast4 ?? null);
  const [byokMonthlyBudgetUsd, setByokMonthlyBudgetUsd] = useState<number>(profile?.byokMonthlyBudgetUsd ?? 25);
  const [byokHardStop, setByokHardStop] = useState<boolean>(profile?.byokHardStop ?? false);
  const [byokSpendUsd, setByokSpendUsd] = useState<number>(0);
  const [byokPlatformOverrideEnabled, setByokPlatformOverrideEnabled] = useState<boolean>(profile?.byokPlatformAccess ?? false);
  const [hasLocalEncryptedByok, setHasLocalEncryptedByok] = useState<boolean>(false);
  const [loadingByok, setLoadingByok] = useState(false);
  const [savingByok, setSavingByok] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingByok(true);
    Promise.all([apiClient.user.getByok(), hasLocalByokApiKey(user.uid)])
      .then(([byok, hasLocalKey]) => {
        setByokEnabled(byok.enabled);
        setByokKeyLast4(byok.keyLast4);
        setByokMonthlyBudgetUsd(byok.monthlyBudgetUsd);
        setByokHardStop(byok.hardStop);
        setByokSpendUsd(byok.estimatedMonthlySpendUsd);
        setByokPlatformOverrideEnabled(byok.platformOverrideEnabled);
        setHasLocalEncryptedByok(hasLocalKey);
      })
      .catch(() => undefined)
      .finally(() => setLoadingByok(false));
  }, [user]);

  const handleDeleteSource = useCallback((sourceKey: string) => {
    deleteDataMutation.mutate({ sources: [sourceKey] }, {
      onSuccess: () => {
        toast.success('Data deleted successfully.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to delete data';
        toast.error(message);
      },
    });
  }, [deleteDataMutation]);

  const handleDeleteAll = useCallback(() => {
    if (confirmText !== 'DELETE') return;

    deleteDataMutation.mutate({}, {
      onSuccess: async () => {
        resetAssessment();
        await refreshProfile();
        setDeleteDialogOpen(false);
        setConfirmText('');
        toast.success('All assessment data has been deleted. Stages have been reset.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to delete data';
        toast.error(message);
      },
    });
  }, [confirmText, deleteDataMutation, resetAssessment, refreshProfile]);

  const handleConsentToggle = useCallback((sourceId: string) => {
    setConsentSources((prev) => {
      const updated = prev.includes(sourceId)
        ? prev.filter((s) => s !== sourceId)
        : [...prev, sourceId];
      // Save immediately
      updateProfileMutation.mutate({ consentSources: updated }, {
        onSuccess: () => refreshProfile(),
      });
      return updated;
    });
  }, [updateProfileMutation, refreshProfile]);

  const handleDisconnectNotion = useCallback(async () => {
    if (!user) return;
    try {
      await disconnectNotion(user.uid);
      await refreshProfile();
      toast.success('Notion disconnected.');
    } catch {
      toast.error('Failed to disconnect Notion.');
    }
  }, [user, refreshProfile]);

  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await apiFetch<Record<string, unknown>>('/api/user/export-data');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lumina-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully.');
    } catch (err) {
      const message = err instanceof FetchError ? err.message : 'Failed to export data';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleDeleteCorpusDoc = useCallback((docId: string) => {
    deleteCorpusDocMutation.mutate(docId, {
      onSuccess: () => {
        corpusDocsQuery.refetch();
        toast.success('Document deleted.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to delete document';
        toast.error(message);
      },
    });
  }, [deleteCorpusDocMutation, corpusDocsQuery]);

  const handleRevokeSource = useCallback((sourceId: string) => {
    deleteDataMutation.mutate({ sources: [sourceId] }, {
      onSuccess: async () => {
        setConsentSources((prev) => prev.filter((source) => source !== sourceId));
        await refreshProfile();
        toast.success('Source revoked and related data removed.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to revoke source';
        toast.error(message);
      },
    });
  }, [deleteDataMutation, refreshProfile]);

  const handleDeleteCorpus = useCallback(async () => {
    setIsDeletingCorpus(true);
    try {
      await apiFetch<{ success: boolean }>('/api/corpus', { method: 'DELETE' });
      await corpusDocsQuery.refetch();
      toast.success('Corpus deleted.');
    } catch (err) {
      const message = err instanceof FetchError ? err.message : 'Failed to delete corpus';
      toast.error(message);
    } finally {
      setIsDeletingCorpus(false);
    }
  }, [corpusDocsQuery]);

  const handleSaveByokPolicy = useCallback(async () => {
    setSavingByok(true);
    try {
      const response = await apiClient.user.updateByok({
        enabled: true,
        monthlyBudgetUsd: byokMonthlyBudgetUsd,
        hardStop: byokHardStop,
      });
      setByokEnabled(response.enabled);
      setByokKeyLast4(response.keyLast4);
      setByokMonthlyBudgetUsd(response.monthlyBudgetUsd);
      setByokHardStop(response.hardStop);
      setByokSpendUsd(response.estimatedMonthlySpendUsd);
      setByokPlatformOverrideEnabled(response.platformOverrideEnabled);
      if (!response.enabled && user) {
        clearLocalByokApiKey(user.uid);
        setHasLocalEncryptedByok(false);
      } else if (user) {
        setHasLocalEncryptedByok(await hasLocalByokApiKey(user.uid));
      }
      await refreshProfile();
      toast.success('BYOK policy saved.');
    } catch (err) {
      const message = err instanceof FetchError ? err.message : 'Failed to save BYOK policy';
      toast.error(message);
    } finally {
      setSavingByok(false);
    }
  }, [byokMonthlyBudgetUsd, byokHardStop, refreshProfile, user]);

  const handleSaveByokKey = useCallback(async () => {
    if (!byokKeyInput.trim() || !user) return;
    setSavingByok(true);
    try {
      const normalizedKey = byokKeyInput.trim();
      const response = await apiClient.user.updateByok({
        apiKey: normalizedKey,
        enabled: true,
      });

      if (response.platformOverrideEnabled) {
        clearLocalByokApiKey(user.uid);
        setHasLocalEncryptedByok(false);
      } else {
        const stored = await setLocalByokApiKey(user.uid, normalizedKey);
        setHasLocalEncryptedByok(stored);
        if (!stored) {
          toast.warning('Saved on server, but local encrypted storage is unavailable in this browser.');
        }
      }

      setByokEnabled(response.enabled);
      setByokKeyLast4(response.keyLast4);
      setByokMonthlyBudgetUsd(response.monthlyBudgetUsd);
      setByokHardStop(response.hardStop);
      setByokSpendUsd(response.estimatedMonthlySpendUsd);
      setByokPlatformOverrideEnabled(response.platformOverrideEnabled);
      setByokKeyInput('');
      await refreshProfile();
      toast.success(response.platformOverrideEnabled ? 'Platform access code accepted.' : 'BYOK key saved securely.');
    } catch (err) {
      const message = err instanceof FetchError ? err.message : 'Failed to save BYOK key';
      toast.error(message);
    } finally {
      setSavingByok(false);
    }
  }, [byokKeyInput, refreshProfile, user]);

  const handleClearByokKey = useCallback(async () => {
    if (!user) return;
    setSavingByok(true);
    try {
      const response = await apiClient.user.updateByok({ clearKey: true });
      clearLocalByokApiKey(user.uid);
      setHasLocalEncryptedByok(false);
      setByokEnabled(response.enabled);
      setByokKeyLast4(response.keyLast4);
      setByokMonthlyBudgetUsd(response.monthlyBudgetUsd);
      setByokHardStop(response.hardStop);
      setByokSpendUsd(response.estimatedMonthlySpendUsd);
      setByokPlatformOverrideEnabled(response.platformOverrideEnabled);
      await refreshProfile();
      toast.success('BYOK key removed.');
    } catch (err) {
      const message = err instanceof FetchError ? err.message : 'Failed to clear BYOK key';
      toast.error(message);
    } finally {
      setSavingByok(false);
    }
  }, [refreshProfile, user]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage your data, privacy, and account settings."
      />

      <StaggerList className="space-y-6">
        {/* Compliance Notice */}
        <StaggerItem>
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Compliance Notice
              </CardTitle>
              <CardDescription className="text-yellow-500/80">
                Lumina currently targets 16+ users, but Gemini API terms may require an 18+ legal path depending on deployment mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-yellow-500/80">
                Treat this as a release gate: resolve legal/commercial eligibility before public launch.
              </p>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Theme Preference */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                Theme Preference
              </CardTitle>
              <CardDescription>
                Switch between light and dark mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Light</span>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dark</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Current theme: {theme === 'dark' ? 'Dark' : 'Light'}
              </p>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Connected Sources */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Database className="h-5 w-5 text-primary" />
                Data Sources & Consent
              </CardTitle>
              <CardDescription>
                Manage account connections, source consent, and data revocation in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Connected Accounts</p>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">Google Account</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                    <Badge>Connected</Badge>
                  </div>
                  {profile?.notionAccessToken && (
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">Notion</p>
                        <p className="text-xs text-muted-foreground">Workspace connected</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Connected</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={handleDisconnectNotion}
                        >
                          <Link2Off className="h-3 w-3 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Source Permissions
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Toggle consent to allow new analysis. Use revoke to remove consent and delete related stored data.
                  </p>
                  <div className="space-y-2">
                    {CONSENT_SOURCE_OPTIONS.map((source) => {
                      const isConsented = consentSources.includes(source.id);
                      return (
                        <div key={source.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                            <Checkbox
                              checked={isConsented}
                              onCheckedChange={() => handleConsentToggle(source.id)}
                              disabled={updateProfileMutation.isPending || deleteDataMutation.isPending}
                            />
                            <div>
                              <p className="text-sm">{source.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {isConsented ? 'Consented' : 'Not consented'}
                              </p>
                            </div>
                          </label>
                          <div className="flex items-center gap-2">
                            <Badge variant={isConsented ? 'secondary' : 'outline'}>
                              {isConsented ? 'Allowed' : 'Blocked'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRevokeSource(source.id)}
                              disabled={!isConsented || deleteDataMutation.isPending || updateProfileMutation.isPending}
                            >
                              <Link2Off className="h-3 w-3 mr-1" />
                              Revoke
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Corpus Documents */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <FileSearch className="h-5 w-5 text-primary" />
                Corpus Documents
              </CardTitle>
              <CardDescription>
                Documents stored in your knowledge corpus.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {corpusDocsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading documents...</p>
              ) : corpusDocsQuery.data && corpusDocsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {corpusDocsQuery.data.map((docItem) => (
                    <div
                      key={docItem.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{docItem.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {docItem.source} &middot; {new Date(docItem.uploadedAt).toLocaleDateString()} &middot; {formatBytes(docItem.sizeBytes)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive ml-2"
                        onClick={() => handleDeleteCorpusDoc(docItem.id)}
                        disabled={deleteCorpusDocMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents stored.</p>
              )}
              <div className="mt-4">
                <LoadingButton
                  variant="outline"
                  loading={isDeletingCorpus}
                  onClick={handleDeleteCorpus}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Entire Corpus
                </LoadingButton>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Data Export */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Download className="h-5 w-5 text-primary" />
                Data Export
              </CardTitle>
              <CardDescription>
                Download a copy of all your data stored in Lumina.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingButton
                onClick={handleExportData}
                loading={isExporting}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </LoadingButton>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* BYOK + Budget */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Database className="h-5 w-5 text-primary" />
                Gemini BYOK & Budget
              </CardTitle>
              <CardDescription>
                Use your own Gemini API key and control monthly estimated spend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingByok ? (
                <p className="text-sm text-muted-foreground">Loading BYOK settings...</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">API key</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {byokPlatformOverrideEnabled && (
                        <Badge variant="secondary">Platform key access enabled</Badge>
                      )}
                      {byokKeyLast4 && (
                        <Badge variant="outline">Server key ending in {byokKeyLast4}</Badge>
                      )}
                      {hasLocalEncryptedByok && (
                        <Badge variant="outline">Encrypted local key ready</Badge>
                      )}
                    </div>
                    <Input
                      type="password"
                      value={byokKeyInput}
                      onChange={(e) => setByokKeyInput(e.target.value)}
                      placeholder={
                        byokPlatformOverrideEnabled
                          ? 'Platform access code is active'
                          : byokKeyLast4
                            ? `Saved key ending in ${byokKeyLast4}`
                            : 'Paste your Gemini API key'
                      }
                    />
                    <div className="flex items-center gap-2">
                      <LoadingButton size="sm" onClick={handleSaveByokKey} loading={savingByok} disabled={!byokKeyInput.trim()}>
                        Save Key
                      </LoadingButton>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearByokKey}
                        disabled={savingByok || (!byokKeyLast4 && !hasLocalEncryptedByok && !byokPlatformOverrideEnabled)}
                      >
                        Remove Key
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your key is encrypted before local browser storage and sent only to your own authenticated API requests.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Monthly budget (USD estimate)</p>
                    <Input
                      type="number"
                      min={1}
                      max={2000}
                      value={String(byokMonthlyBudgetUsd)}
                      onChange={(e) => setByokMonthlyBudgetUsd(Number(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current month estimated spend: ${byokSpendUsd.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Hard stop when budget is exceeded</p>
                    <Switch checked={byokHardStop} onCheckedChange={setByokHardStop} />
                  </div>
                  <LoadingButton onClick={handleSaveByokPolicy} loading={savingByok}>
                    Save BYOK Policy
                  </LoadingButton>
                </>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* What Data We Have */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <button
                onClick={() => setShowDataSection(!showDataSection)}
                className="flex items-center gap-2 text-left w-full"
              >
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="font-sans flex-1">What Data We Have</CardTitle>
                <motion.span
                  animate={{ rotate: showDataSection ? 90 : 0 }}
                  transition={snappySpring}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.span>
              </button>
              <CardDescription>
                View and manage individual data categories.
              </CardDescription>
            </CardHeader>
            <AnimatePresence initial={false}>
              {showDataSection && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={shouldReduceMotion ? reducedMotionVariants : collapseExpand}
                  className="overflow-hidden"
                >
                  <CardContent>
                    <motion.div
                      variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
                      className="space-y-3"
                    >
                      {DATA_SOURCES.map((source) => (
                        <motion.div
                          key={source.key}
                          variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{source.label}</p>
                            <p className="text-xs text-muted-foreground">{source.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSource(source.key)}
                            disabled={deleteDataMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </StaggerItem>

        {/* Notifications */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
                <Badge variant="secondary" className="ml-1 text-xs">Coming soon</Badge>
              </CardTitle>
              <CardDescription>
                Configure how and when Lumina notifies you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 opacity-60">
                {NOTIFICATION_OPTIONS.map((option) => (
                  <label key={option.id} className="flex items-center gap-3 cursor-not-allowed">
                    <Checkbox disabled checked={false} />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Delete All Data */}
        <StaggerItem>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete All My Data
              </CardTitle>
              <CardDescription>
                Permanently delete all assessment data and reset your progress. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <Button variant="destructive">Delete All Data</Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your assessment data including quiz answers, session insights, and your talent report. Your account will remain but all stages will be reset.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium">
                      Type <span className="font-mono font-bold">DELETE</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="mt-2 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                      placeholder="DELETE"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setConfirmText(''); }}>
                      Cancel
                    </Button>
                    <LoadingButton
                      variant="destructive"
                      onClick={handleDeleteAll}
                      loading={deleteDataMutation.isPending}
                      disabled={confirmText !== 'DELETE'}
                    >
                      Delete Everything
                    </LoadingButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerList>
    </div>
  );
}
