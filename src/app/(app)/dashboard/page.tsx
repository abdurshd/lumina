"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTalentReportQuery } from "@/hooks/use-api-queries";
import { PreCompletionDashboard } from "@/components/dashboard/pre-completion-dashboard";
import { PostCompletionDashboard } from "@/components/dashboard/post-completion-dashboard";
import { triggerAgentEvaluation } from "@/lib/agent/evaluate-client";

export default function DashboardPage() {
  const { profile, loading } = useAuthStore();
  const uid = profile?.uid;

  const { data: report, isLoading: reportLoading } =
    useTalentReportQuery(uid);

  const allCompleted = profile
    ? Object.values(profile.stages).filter((s) => s === "completed").length ===
      4
    : false;

  const showPostCompletion = allCompleted && !!report && !reportLoading;

  // Re-evaluate agent state on mount (Zustand is in-memory, so store is empty after reload)
  useEffect(() => {
    if (!uid || loading) return;
    const hasProgress = profile
      ? Object.values(profile.stages).some((s) => s === "completed")
      : false;
    if (hasProgress) {
      void triggerAgentEvaluation(uid);
    }
  }, [uid, loading, profile]);

  if (showPostCompletion) {
    return <PostCompletionDashboard report={report} />;
  }

  if (!profile && loading) {
    return (
      <PreCompletionDashboard
        profile={{
          uid: "",
          email: "",
          displayName: "",
          photoURL: "",
          createdAt: 0,
          stages: {
            connections: "locked",
            quiz: "locked",
            session: "locked",
            report: "locked",
          },
        }}
        loading={true}
      />
    );
  }

  if (!profile) {
    return null;
  }

  return <PreCompletionDashboard profile={profile} loading={loading} />;
}
