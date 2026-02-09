'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { useDeleteDataMutation, useUpdateProfileMutation } from '@/hooks/use-api-mutations';
import { disconnectNotion } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import { PageHeader, LoadingButton } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Settings, Trash2, Database, Shield, ChevronDown, ChevronRight, User, Link2Off } from 'lucide-react';

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

export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuthStore();
  const { reset: resetAssessment } = useAssessmentStore();
  const deleteDataMutation = useDeleteDataMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  const [showDataSection, setShowDataSection] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [consentSources, setConsentSources] = useState<string[]>(profile?.consentSources ?? []);

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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage your data, privacy, and account settings."
      />

      {/* Profile */}
      <Card className="mb-6 animate-fade-in">
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
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
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
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{profile?.displayName}</p>
              )}
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

      {/* Privacy & Consent */}
      <Card className="mb-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
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

      {/* Connected Sources */}
      <Card className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
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

      {/* What Data We Have */}
      <Card className="mb-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <button
            onClick={() => setShowDataSection(!showDataSection)}
            className="flex items-center gap-2 text-left w-full"
          >
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="font-sans flex-1">What Data We Have</CardTitle>
            {showDataSection ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <CardDescription>
            View and manage individual data categories.
          </CardDescription>
        </CardHeader>
        {showDataSection && (
          <CardContent>
            <div className="space-y-3">
              {DATA_SOURCES.map((source) => (
                <div key={source.key} className="flex items-center justify-between rounded-lg border p-3">
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
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Delete All Data */}
      <Card className="border-destructive/30 animate-fade-in" style={{ animationDelay: '200ms' }}>
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
              <Button variant="destructive">Delete All Data</Button>
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
    </div>
  );
}
