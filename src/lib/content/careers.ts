/**
 * Career-cluster content layer for `/careers/{slug}`.
 *
 * Wraps the O*NET cluster table in `src/lib/career/onet-clusters.ts` with the
 * per-letter RIASEC narrative + dimension mapping rendered on the public
 * cluster pages. The clusters themselves are the authoritative data — this
 * file is just the renderable shape.
 */

import {
  ONET_CLUSTERS,
  getClusterById,
  type OnetCluster,
} from "@/lib/career/onet-clusters";

export type RiasecLetter = "R" | "I" | "A" | "S" | "E" | "C";

interface RiasecLetterInfo {
  letter: RiasecLetter;
  name: string;
  blurb: string;
  /** Lumina dimension keys most predictive of fit on this letter. */
  alignedDimensions: string[];
}

const RIASEC_INFO: Record<RiasecLetter, RiasecLetterInfo> = {
  R: {
    letter: "R",
    name: "Realistic",
    blurb:
      "Hands-on work with tools, machines, materials, or physical environments. Strong fit for people who think with their hands as much as their head.",
    alignedDimensions: ["technical_aptitude", "problem_solving"],
  },
  I: {
    letter: "I",
    name: "Investigative",
    blurb:
      "Solving problems through analysis, research, and systematic exploration. Strong fit for people who enjoy taking things apart to see how they work.",
    alignedDimensions: ["analytical_thinking", "problem_solving", "Investigative"],
  },
  A: {
    letter: "A",
    name: "Artistic",
    blurb:
      "Self-expressive, original, and unstructured work. Strong fit for people whose best output emerges from open-ended creative space.",
    alignedDimensions: ["creative_thinking", "communication", "Artistic"],
  },
  S: {
    letter: "S",
    name: "Social",
    blurb:
      "Helping, teaching, and developing other people. Strong fit for people whose energy comes from one-to-one or small-group human interaction.",
    alignedDimensions: ["communication", "teamwork", "emotional_intelligence"],
  },
  E: {
    letter: "E",
    name: "Enterprising",
    blurb:
      "Leading, persuading, and managing toward outcomes. Strong fit for people who enjoy moving organizations or initiatives forward.",
    alignedDimensions: ["leadership", "communication", "Enterprising"],
  },
  C: {
    letter: "C",
    name: "Conventional",
    blurb:
      "Organizing data, following procedures, maintaining records and systems. Strong fit for people who get satisfaction from structured, accurate work.",
    alignedDimensions: ["analytical_thinking", "work_values", "Conventional"],
  },
};

export interface ClusterContent {
  cluster: OnetCluster;
  /** Slug used in `/careers/{slug}`. Matches `cluster.id`. */
  slug: string;
  /** RIASEC letters aggregated across all the cluster's primary codes. */
  primaryLetters: RiasecLetter[];
  /** Letter info objects in priority order. */
  letterInfo: RiasecLetterInfo[];
  /** Lumina dimensions that contribute most to a strong fit. */
  alignedDimensions: string[];
  /** Other clusters that share at least one primary RIASEC letter. */
  relatedClusterIds: string[];
}

function dedupe<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function lettersFor(cluster: OnetCluster): RiasecLetter[] {
  const seen: RiasecLetter[] = [];
  for (const code of cluster.riasecCodes) {
    for (const ch of code) {
      if (
        (ch === "R" ||
          ch === "I" ||
          ch === "A" ||
          ch === "S" ||
          ch === "E" ||
          ch === "C") &&
        !seen.includes(ch)
      ) {
        seen.push(ch);
      }
    }
  }
  return seen;
}

function relatedFor(cluster: OnetCluster, letters: RiasecLetter[]): string[] {
  const own = cluster.id;
  const scored: Array<{ id: string; overlap: number }> = [];
  for (const candidate of ONET_CLUSTERS) {
    if (candidate.id === own) continue;
    const candidateLetters = lettersFor(candidate);
    const overlap = candidateLetters.filter((l) => letters.includes(l)).length;
    if (overlap > 0) scored.push({ id: candidate.id, overlap });
  }
  return scored
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3)
    .map((s) => s.id);
}

export function buildClusterContent(cluster: OnetCluster): ClusterContent {
  const primaryLetters = lettersFor(cluster);
  const letterInfo = primaryLetters.map((l) => RIASEC_INFO[l]);
  const alignedDimensions = dedupe(
    letterInfo.flatMap((info) => info.alignedDimensions)
  );
  return {
    cluster,
    slug: cluster.id,
    primaryLetters,
    letterInfo,
    alignedDimensions,
    relatedClusterIds: relatedFor(cluster, primaryLetters),
  };
}

export function getClusterContent(slug: string): ClusterContent | undefined {
  const cluster = getClusterById(slug);
  return cluster ? buildClusterContent(cluster) : undefined;
}

export const ALL_CLUSTER_SLUGS: readonly string[] = ONET_CLUSTERS.map(
  (c) => c.id
);

export { ONET_CLUSTERS, RIASEC_INFO };
