"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useTalentReportQuery } from "@/hooks/use-api-queries";
import { PreCompletionDashboard } from "@/components/dashboard/pre-completion-dashboard";
import { PostCompletionDashboard } from "@/components/dashboard/post-completion-dashboard";

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
