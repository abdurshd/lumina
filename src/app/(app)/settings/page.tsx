'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { useDeleteDataMutation, useUpdateProfileMutation, useDeleteCorpusDocMutation } from '@/hooks/use-api-mutations';
import { useCorpusDocumentsQuery } from '@/hooks/use-api-queries';
import { disconnectNotion } from '@/lib/firebase/firestore';
import { FetchError, apiFetch } from '@/lib/fetch-client';
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
import { Settings, Trash2, Database, Shield, ChevronRight, User, Link2Off, Download, FileSearch, Bell, Sun, Moon, AlertTriangle } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { staggerContainer, staggerItem, reducedMotionVariants, collapseExpand, snappySpring, smoothTransition } from '@/lib/motion';

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
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [consentSources, setConsentSources] = useState<string[]>(profile?.consentSources ?? []);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleSaveName = useCallback(() => {
    if (!displayName.trim()) return;
    updateProfileMutation.mutate({ displayName: displayName.trim() }, {
      onSuccess: async () => {
        await refreshProfile();
        setIsEditingName(false);
        toast.success('Display name updated.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to update name';
        toast.error(message);
      },
    });
  }, [displayName, updateProfileMutation, refreshProfile]);

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

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
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

        {/* Profile */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Display Name</p>
                  <AnimatePresence mode="wait">
                    {isEditingName ? (
                      <motion.div
                        key="edit"
                        className="flex items-center gap-2 mt-1"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        transition={smoothTransition}
                      >
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="h-8 w-60"
                        />
                        <Button size="sm" onClick={handleSaveName} disabled={updateProfileMutation.isPending}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setIsEditingName(false); setDisplayName(profile?.displayName ?? ''); }}>
                          Cancel
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.p
                        key="display"
                        className="text-xs text-muted-foreground"
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {profile?.displayName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                {!isEditingName && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>
                    Edit
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
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

        {/* Privacy & Consent */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Consent
              </CardTitle>
              <CardDescription>
                Update which data sources you consent to. Changes take effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CONSENT_SOURCE_OPTIONS.map((source) => (
                  <label key={source.id} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={consentSources.includes(source.id)}
                      onCheckedChange={() => handleConsentToggle(source.id)}
                    />
                    <span className="text-sm">{source.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Connected Sources */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Database className="h-5 w-5 text-primary" />
                Connected Data Sources
              </CardTitle>
              <CardDescription>
                These are the sources you&apos;ve connected to Lumina.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Google Account</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                  <Badge>Connected</Badge>
                </div>
                {profile?.notionAccessToken && (
                  <div className="flex items-center justify-between">
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
