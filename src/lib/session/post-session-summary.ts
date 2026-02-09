import type { SessionInsight, UserSignal } from '@/types';
import { SESSION_CATEGORY_DIMENSION_WEIGHTS, normalizeDimensionName } from '@/lib/psychometrics/dimension-model';

interface LiveSessionArtifacts {
  insights: SessionInsight[];
  signals: UserSignal[];
}

interface AggregatedInsight {
  category: SessionInsight['category'];
  observation: string;
  evidence: string;
  confidenceSum: number;
  count: number;
  timestamp: number;
}

interface AggregatedSignal {
  signal: string;
  evidence: string;
  confidenceSum: number;
  count: number;
  timestamp: number;
  dimensions: Set<string>;
}

export function summarizeLiveSessionArtifacts(
  artifacts: LiveSessionArtifacts,
): LiveSessionArtifacts {
  const summarizedInsights = summarizeInsights(artifacts.insights);
  const summarizedSignals = summarizeSignals(artifacts.signals, summarizedInsights);

  return {
    insights: summarizedInsights,
    signals: summarizedSignals,
  };
}

function summarizeInsights(insights: SessionInsight[]): SessionInsight[] {
  const grouped = new Map<string, AggregatedInsight>();

  for (const insight of insights) {
    const key = `${insight.category}:${normalizeText(insight.observation)}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.confidenceSum += normalizeConfidence(insight.confidence);
      existing.count += 1;
      existing.timestamp = Math.max(existing.timestamp, insight.timestamp);
      if (insight.evidence && !existing.evidence.includes(insight.evidence)) {
        existing.evidence = `${existing.evidence}; ${insight.evidence}`.slice(0, 400);
      }
      continue;
    }

    grouped.set(key, {
      category: insight.category,
      observation: insight.observation,
      evidence: insight.evidence ?? '',
      confidenceSum: normalizeConfidence(insight.confidence),
      count: 1,
      timestamp: insight.timestamp,
    });
  }

  return Array.from(grouped.values())
    .map((group) => ({
      timestamp: group.timestamp,
      category: group.category,
      observation: group.observation,
      confidence: clamp01(group.confidenceSum / group.count),
      evidence: group.evidence,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function summarizeSignals(signals: UserSignal[], insights: SessionInsight[]): UserSignal[] {
  const grouped = new Map<string, AggregatedSignal>();

  for (const signal of signals) {
    const key = normalizeText(signal.signal);
    const existing = grouped.get(key);

    if (existing) {
      existing.confidenceSum += normalizeConfidence(signal.confidence);
      existing.count += 1;
      existing.timestamp = Math.max(existing.timestamp, signal.timestamp);
      if (signal.evidence && !existing.evidence.includes(signal.evidence)) {
        existing.evidence = `${existing.evidence}; ${signal.evidence}`.slice(0, 500);
      }
      for (const dim of signal.dimensions ?? []) {
        const normalized = normalizeDimensionName(dim);
        if (normalized) existing.dimensions.add(normalized);
      }
      continue;
    }

    const dimensions = new Set<string>();
    for (const dim of signal.dimensions ?? []) {
      const normalized = normalizeDimensionName(dim);
      if (normalized) dimensions.add(normalized);
    }

    grouped.set(key, {
      signal: signal.signal,
      evidence: signal.evidence,
      confidenceSum: normalizeConfidence(signal.confidence),
      count: 1,
      timestamp: signal.timestamp,
      dimensions,
    });
  }

  return Array.from(grouped.values())
    .map((group, index) => {
      const inferred = inferDimensions(group.signal, group.evidence, insights);
      for (const dim of inferred) {
        group.dimensions.add(dim);
      }

      const evidenceExcerpt = group.evidence.trim() || group.signal;
      return {
        id: `signal_summarized_${group.timestamp}_${index}`,
        signal: group.signal,
        source: 'live_session_summary',
        evidence: group.evidence,
        confidence: clamp01(group.confidenceSum / group.count),
        timestamp: group.timestamp,
        dimensions: Array.from(group.dimensions),
        evidenceRef: {
          type: 'session',
          transcriptTimestamp: group.timestamp,
          excerpt: evidenceExcerpt.slice(0, 240),
        },
      } satisfies UserSignal;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

function inferDimensions(signal: string, evidence: string, insights: SessionInsight[]): string[] {
  const text = `${signal} ${evidence}`.toLowerCase();
  const inferred = new Set<string>();

  const tokens = text.split(/[^a-z0-9_]+/).filter(Boolean);
  for (const token of tokens) {
    const normalized = normalizeDimensionName(token);
    if (normalized) inferred.add(normalized);
  }

  for (const insight of insights) {
    if (!text.includes(insight.category.replace(/_/g, ' '))) continue;
    const mapped = SESSION_CATEGORY_DIMENSION_WEIGHTS[insight.category];
    for (const [dimension, weight] of Object.entries(mapped)) {
      if (typeof weight === 'number' && weight >= 0.5) {
        inferred.add(dimension);
      }
    }
  }

  return Array.from(inferred);
}

function normalizeText(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value > 1 ? clamp01(value / 100) : clamp01(value);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
