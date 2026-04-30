/**
 * Privacy-preserving report sharing.
 *
 * Owners publish a snapshot of their report under a public slug. The
 * snapshot is *anonymized* server-side at publish time — evidence excerpts
 * (which can quote raw user content) are replaced with category labels, and
 * second-person voice in the narrative fields is neutralized.
 *
 * Stored shape:
 *   `sharedReports/{slug}` — {
 *     slug: string;
 *     ownerUid: string;
 *     createdAt: number;
 *     updatedAt: number;
 *     report: AnonymizedTalentReport;     // deep clone, no excerpts
 *     ownerHandle: string;                // friendly display label, no PII
 *     revoked: boolean;
 *   }
 *
 * `users/{uid}.shareReportSlug` — points back at the user's current share.
 */

import type {
  TalentReportResponse,
} from "@/lib/schemas/report";

const SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // base32 minus look-alikes
const SLUG_LENGTH = 10;

const SLUG_REGEX = new RegExp(`^[${SLUG_ALPHABET}]{${SLUG_LENGTH}}$`);

export const SHARE_SLUG_LENGTH = SLUG_LENGTH;

export function isValidShareSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_REGEX.test(value);
}

export function generateShareSlug(): string {
  const buf = new Uint8Array(SLUG_LENGTH);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    out += SLUG_ALPHABET[buf[i] % SLUG_ALPHABET.length];
  }
  return out;
}

// --- Anonymization ---

const SOURCE_LABEL: Record<string, string> = {
  quiz: "Quiz responses",
  session: "Live session moments",
  data_source: "Connected data",
  signal: "Behavioral signal",
};

function labelFor(sourceKey: string): string {
  const key = sourceKey.toLowerCase();
  if (SOURCE_LABEL[key]) return SOURCE_LABEL[key];
  if (key.includes("gmail")) return "Connected email";
  if (key.includes("drive") || key.includes("doc")) return "Connected documents";
  if (key.includes("notion")) return "Connected notes";
  if (key.includes("chatgpt") || key.includes("gemini") || key.includes("claude"))
    return "Connected AI conversations";
  if (key.includes("file") || key.includes("upload")) return "Uploaded files";
  return "Connected source";
}

function neutralizeVoice(text: string): string {
  // Replace common second-person constructions with neutral third-person.
  // Intentionally simple — we are accepting some grammatical roughness in
  // exchange for fully predictable output.
  return text
    .replace(/\bYour\b/g, "Their")
    .replace(/\byour\b/g, "their")
    .replace(/\bYou are\b/g, "They are")
    .replace(/\byou are\b/g, "they are")
    .replace(/\bYou'll\b/g, "They'll")
    .replace(/\byou'll\b/g, "they'll")
    .replace(/\bYou'd\b/g, "They'd")
    .replace(/\byou'd\b/g, "they'd")
    .replace(/\bYou'r\b/g, "They're")
    .replace(/\byou're\b/g, "they're")
    .replace(/\bYou\b/g, "They")
    .replace(/\byou\b/g, "they");
}

export interface AnonymizedTalentReport {
  headline: string;
  tagline: string;
  radarDimensions: TalentReportResponse["radarDimensions"];
  topStrengths: Array<{
    name: string;
    score: number;
    evidenceLabel: string;
    confidenceLevel: "high" | "medium" | "low";
  }>;
  hiddenTalents: string[];
  careerPaths: Array<{
    title: string;
    match: number;
    description: string;
    nextSteps: string[];
    riasecCodes: string;
    onetCluster: string;
    confidence: number;
    whyAnyone: string;
    evidenceLabels: string[];
  }>;
  actionPlan: TalentReportResponse["actionPlan"];
  personalityInsights: string[];
  confidenceNotes: string[];
}

/**
 * Strip personal evidence excerpts and neutralize second-person voice. The
 * structural narrative — strengths, career matches, action plan — stays
 * intact.
 */
export function anonymizeReport(
  report: TalentReportResponse
): AnonymizedTalentReport {
  return {
    headline: report.headline,
    tagline: report.tagline,
    radarDimensions: report.radarDimensions,
    topStrengths: report.topStrengths.map((s) => ({
      name: s.name,
      score: s.score,
      confidenceLevel: s.confidenceLevel,
      evidenceLabel: summarizeEvidenceSources(
        s.evidenceSources.map((e) => e.source)
      ),
    })),
    hiddenTalents: report.hiddenTalents,
    careerPaths: report.careerPaths.map((c) => ({
      title: c.title,
      match: c.match,
      description: c.description,
      nextSteps: c.nextSteps,
      riasecCodes: c.riasecCodes,
      onetCluster: c.onetCluster,
      confidence: c.confidence,
      whyAnyone: neutralizeVoice(c.whyYou),
      evidenceLabels: dedupe(c.evidenceSources.map(labelFor)),
    })),
    actionPlan: report.actionPlan,
    personalityInsights: report.personalityInsights.map(neutralizeVoice),
    confidenceNotes: report.confidenceNotes,
  };
}

function summarizeEvidenceSources(sources: string[]): string {
  const labels = dedupe(sources.map(labelFor));
  if (labels.length === 0) return "Multiple sources";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

export interface SharedReportDoc {
  slug: string;
  ownerUid: string;
  createdAt: number;
  updatedAt: number;
  report: AnonymizedTalentReport;
  ownerHandle: string;
  revoked: boolean;
}

export function buildShareUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/$/, "")}/r/${slug}`;
}
