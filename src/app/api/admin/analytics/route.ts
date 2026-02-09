import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { AnalyticsEvent } from '@/types';

interface FunnelCounts {
  stage_started: number;
  stage_completed: number;
  quiz_module_completed: number;
  session_started: number;
  session_ended: number;
  report_generated: number;
  data_source_connected: number;
}

interface SessionStats {
  totalSessions: number;
  avgDurationMs: number;
  reconnections: number;
}

interface FeedbackDistribution {
  report_feedback: number;
  report_regenerated: number;
  challenge_completed: number;
  reflection_submitted: number;
}

interface AggregatedAnalytics {
  funnel: FunnelCounts;
  sessionStats: SessionStats;
  feedback: FeedbackDistribution;
  satisfactionAvg: number;
  satisfactionCount: number;
  totalEvents: number;
}

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const analyticsRef = collection(db, 'users', authResult.uid, 'analytics');
    const analyticsQuery = query(analyticsRef, orderBy('timestamp', 'desc'), limit(500));
    const snapshot = await getDocs(analyticsQuery);

    const events: AnalyticsEvent[] = snapshot.docs.map((doc) => doc.data() as AnalyticsEvent);

    // Aggregate funnel counts
    const funnel: FunnelCounts = {
      stage_started: 0,
      stage_completed: 0,
      quiz_module_completed: 0,
      session_started: 0,
      session_ended: 0,
      report_generated: 0,
      data_source_connected: 0,
    };

    const sessionStats: SessionStats = {
      totalSessions: 0,
      avgDurationMs: 0,
      reconnections: 0,
    };

    const feedback: FeedbackDistribution = {
      report_feedback: 0,
      report_regenerated: 0,
      challenge_completed: 0,
      reflection_submitted: 0,
    };

    let satisfactionTotal = 0;
    let satisfactionCount = 0;

    const sessionStarts: number[] = [];
    const sessionEnds: number[] = [];

    for (const event of events) {
      // Funnel counts
      if (event.type in funnel) {
        funnel[event.type as keyof FunnelCounts]++;
      }

      // Session tracking
      if (event.type === 'session_started') {
        sessionStarts.push(event.timestamp);
        sessionStats.totalSessions++;
      }
      if (event.type === 'session_ended') {
        sessionEnds.push(event.timestamp);
      }
      if (event.type === 'session_reconnected') {
        sessionStats.reconnections++;
      }

      // Feedback distribution
      if (event.type in feedback) {
        feedback[event.type as keyof FeedbackDistribution]++;
      }

      // Satisfaction
      if (event.type === 'satisfaction_rating' && event.metadata?.rating !== undefined) {
        const rating = Number(event.metadata.rating);
        if (!isNaN(rating)) {
          satisfactionTotal += rating;
          satisfactionCount++;
        }
      }
    }

    // Calculate average session duration (pair starts with ends chronologically)
    const sortedStarts = [...sessionStarts].sort((a, b) => a - b);
    const sortedEnds = [...sessionEnds].sort((a, b) => a - b);
    const pairedCount = Math.min(sortedStarts.length, sortedEnds.length);
    let totalDuration = 0;
    for (let i = 0; i < pairedCount; i++) {
      totalDuration += sortedEnds[i] - sortedStarts[i];
    }
    sessionStats.avgDurationMs = pairedCount > 0 ? Math.round(totalDuration / pairedCount) : 0;

    const result: AggregatedAnalytics = {
      funnel,
      sessionStats,
      feedback,
      satisfactionAvg: satisfactionCount > 0 ? Math.round((satisfactionTotal / satisfactionCount) * 10) / 10 : 0,
      satisfactionCount,
      totalEvents: events.length,
    };

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Analytics Error]', message);
    return errorResponse('Failed to fetch analytics', ErrorCode.INTERNAL_ERROR, 500);
  }
}
