'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth-store';

export function AppProviders({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    const unsub = useAuthStore.getState().initAuthListener();
    return unsub;
  }, []);

  const lastSeenJobRef = useRef<{ jobId: string; status: 'queued' | 'running' | 'completed' | 'failed' } | null>(null);

  useEffect(() => {
    if (!user) {
      lastSeenJobRef.current = null;
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const { job } = await apiClient.gemini.reportJobStatus();
        if (cancelled || !job) return;

        const previous = lastSeenJobRef.current;
        const changed = previous?.jobId !== job.jobId || previous?.status !== job.status;
        const notificationKey = `lumina:report-job-notified:${user.uid}`;
        const notificationId = `${job.jobId}:${job.status}`;
        const alreadyNotified = window.sessionStorage.getItem(notificationKey) === notificationId;

        if (changed && job.status === 'completed' && !alreadyNotified) {
          toast.success('Your talent report is ready.');
          window.sessionStorage.setItem(notificationKey, notificationId);
          await queryClient.invalidateQueries({
            queryKey: ['talentReport', user.uid],
          });
        } else if (changed && job.status === 'failed' && !alreadyNotified) {
          toast.error(job.error ?? 'Report generation failed.');
          window.sessionStorage.setItem(notificationKey, notificationId);
        }

        lastSeenJobRef.current = {
          jobId: job.jobId,
          status: job.status,
        };
      } catch {
        // Silent polling failures.
      }
    };

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, 6_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [user, queryClient]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
