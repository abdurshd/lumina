import type {
  SessionInsight,
  BehavioralCategory,
  BehavioralTrend,
  BehavioralCorrelation,
  TimelineSnapshot,
} from '@/types';

const SNAPSHOT_INTERVAL_MS = 30_000; // 30 seconds between snapshots
const MIN_SAMPLES_FOR_TREND = 3;

/**
 * Accumulates timestamped behavioral observations during a live session
 * and computes trends, correlations, and narrative summaries.
 */
export class BehavioralTimeline {
  private observations: SessionInsight[] = [];
  private snapshots: TimelineSnapshot[] = [];
  private lastSnapshotTime = 0;

  addObservation(insight: SessionInsight): void {
    this.observations.push(insight);
    this.maybeSnapshot(insight.timestamp);
  }

  getObservations(): SessionInsight[] {
    return this.observations;
  }

  getSnapshots(): TimelineSnapshot[] {
    return this.snapshots;
  }

  /**
   * Compute rising/falling/stable trends for each behavioral category.
   * Compares average confidence in the first half vs second half of observations.
   */
  computeTrends(): BehavioralTrend[] {
    const byCategory = this.groupByCategory();
    const trends: BehavioralTrend[] = [];

    for (const [category, items] of byCategory.entries()) {
      if (items.length < MIN_SAMPLES_FOR_TREND) continue;

      const mid = Math.floor(items.length / 2);
      const firstHalf = items.slice(0, mid);
      const secondHalf = items.slice(mid);

      const startAvg = avg(firstHalf.map((i) => i.confidence));
      const endAvg = avg(secondHalf.map((i) => i.confidence));
      const delta = endAvg - startAvg;

      let direction: BehavioralTrend['direction'] = 'stable';
      if (delta > 0.1) direction = 'rising';
      else if (delta < -0.1) direction = 'falling';

      trends.push({
        category,
        direction,
        startAvg: round(startAvg),
        endAvg: round(endAvg),
        delta: round(delta),
        sampleCount: items.length,
      });
    }

    return trends.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  /**
   * Find topic-behavior correlations by examining which dimensions/topics
   * were being discussed when behavioral signals changed.
   */
  findCorrelations(): BehavioralCorrelation[] {
    const correlations: BehavioralCorrelation[] = [];
    const topicObservations = this.observations.filter((o) => o.dimension);

    if (topicObservations.length < 2) return correlations;

    // Group observations by dimension
    const byDimension = new Map<string, SessionInsight[]>();
    for (const obs of topicObservations) {
      const dim = obs.dimension!;
      const existing = byDimension.get(dim) ?? [];
      existing.push(obs);
      byDimension.set(dim, existing);
    }

    // For each dimension, check if any category shows a consistent shift
    const overallAvgs = this.categoryAverages(this.observations);

    for (const [dimension, dimObs] of byDimension.entries()) {
      const dimAvgs = this.categoryAverages(dimObs);

      for (const [category, dimAvg] of dimAvgs.entries()) {
        const overallAvg = overallAvgs.get(category);
        if (overallAvg === undefined) continue;

        const diff = dimAvg - overallAvg;
        const strength = Math.min(Math.abs(diff), 1);

        if (strength < 0.15) continue;

        const effect: BehavioralCorrelation['effect'] = diff > 0 ? 'increase' : 'decrease';
        const description =
          effect === 'increase'
            ? `${category} rises when discussing ${dimension}`
            : `${category} drops when discussing ${dimension}`;

        correlations.push({
          category,
          topic: dimension,
          effect,
          strength: round(strength),
          description,
        });
      }
    }

    return correlations.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Generate a natural-language narrative summarizing the behavioral arc.
   */
  generateNarrative(): string {
    if (this.observations.length === 0) {
      return 'No behavioral observations recorded yet.';
    }

    const trends = this.computeTrends();
    const correlations = this.findCorrelations();
    const parts: string[] = [];

    // Summarize overall duration
    const first = this.observations[0].timestamp;
    const last = this.observations[this.observations.length - 1].timestamp;
    const durationMin = Math.round((last - first) / 60_000);
    parts.push(
      `Over ${durationMin} minute${durationMin !== 1 ? 's' : ''}, ${this.observations.length} behavioral signals were observed.`
    );

    // Notable trends
    const notable = trends.filter((t) => t.direction !== 'stable');
    if (notable.length > 0) {
      const trendDescriptions = notable
        .slice(0, 3)
        .map(
          (t) =>
            `${t.category} ${t.direction === 'rising' ? 'increased' : 'decreased'} (${t.delta > 0 ? '+' : ''}${(t.delta * 100).toFixed(0)}%)`
        );
      parts.push(`Key trends: ${trendDescriptions.join(', ')}.`);
    }

    // Top correlations
    if (correlations.length > 0) {
      const topCorrelations = correlations
        .slice(0, 2)
        .map((c) => c.description);
      parts.push(`Notable patterns: ${topCorrelations.join('; ')}.`);
    }

    return parts.join(' ');
  }

  /** Reset the timeline for a new session. */
  clear(): void {
    this.observations = [];
    this.snapshots = [];
    this.lastSnapshotTime = 0;
  }

  // --- Private helpers ---

  private maybeSnapshot(timestamp: number): void {
    if (timestamp - this.lastSnapshotTime < SNAPSHOT_INTERVAL_MS) return;

    const categories: TimelineSnapshot['categories'] = {};
    const avgs = this.categoryAverages(this.observations);

    for (const [cat, val] of avgs.entries()) {
      categories[cat] = round(val);
    }

    this.snapshots.push({ timestamp, categories });
    this.lastSnapshotTime = timestamp;
  }

  private groupByCategory(): Map<BehavioralCategory, SessionInsight[]> {
    const map = new Map<BehavioralCategory, SessionInsight[]>();
    for (const obs of this.observations) {
      const existing = map.get(obs.category) ?? [];
      existing.push(obs);
      map.set(obs.category, existing);
    }
    return map;
  }

  private categoryAverages(items: SessionInsight[]): Map<BehavioralCategory, number> {
    const sums = new Map<BehavioralCategory, { total: number; count: number }>();
    for (const obs of items) {
      const entry = sums.get(obs.category) ?? { total: 0, count: 0 };
      entry.total += obs.confidence;
      entry.count += 1;
      sums.set(obs.category, entry);
    }

    const avgs = new Map<BehavioralCategory, number>();
    for (const [cat, { total, count }] of sums.entries()) {
      avgs.set(cat, total / count);
    }
    return avgs;
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
