import { z } from 'zod';
import { getGeminiClientForUser } from '@/lib/gemini/client';
import { GEMINI_MODELS, type GeminiModelId } from '@/lib/gemini/models';
import { safeParseJson, GeminiError } from '@/lib/api-helpers';
import { trackGeminiUsage } from '@/lib/gemini/byok';
import { TalentReportSchema } from '@/lib/schemas/report';
import {
  REPORT_CRITIQUE_PROMPT,
  REPORT_REFINEMENT_PROMPT,
  REPORT_VALIDATION_PROMPT,
} from '@/lib/gemini/prompts';
import type { TalentReport, ReportTraceStep } from '@/types';

export interface SectionCritique {
  section: string;
  evidenceQuality: number;
  issues: string[];
  suggestedFix: string;
}

export interface CritiqueResult {
  overallScore: number;
  sections: SectionCritique[];
  contradictions: string[];
  unsupportedClaims: string[];
  lowConfidenceMatches: string[];
}

const CritiqueSchema = z.object({
  overallScore: z.number().min(0).max(100),
  sections: z.array(
    z.object({
      section: z.string(),
      evidenceQuality: z.number().min(0).max(100),
      issues: z.array(z.string()),
      suggestedFix: z.string(),
    })
  ),
  contradictions: z.array(z.string()),
  unsupportedClaims: z.array(z.string()),
  lowConfidenceMatches: z.array(z.string()),
});

const REFINEMENT_THRESHOLD = 60;

// --- Main report agent ---

/**
 * Multi-step report generation: Generate → Critique → Refine → Validate.
 * Returns the final report and a trace of all steps taken.
 */
export async function generateReportWithAgent(params: {
  uid: string;
  context: string;
  reportPrompt: string;
}): Promise<{ report: TalentReport; trace: ReportTraceStep[] }> {
  const { uid, context, reportPrompt } = params;
  const trace: ReportTraceStep[] = [];

  // --- Step 1: Generate Draft ---
  const step1Start = Date.now();
  const draft = await callGemini({
    uid,
    model: GEMINI_MODELS.DEEP,
    prompt: reportPrompt,
    feature: 'report_generate_draft',
  });

  const draftJson = safeParseJson(draft);
  const draftReport = TalentReportSchema.parse(draftJson);

  trace.push({
    step: 1,
    name: 'Generate Draft',
    description: 'Initial report generated from all assessment data using Gemini 3 Pro.',
    inputSummary: `${context.length} chars of assessment data`,
    outputSummary: `${draftReport.careerPaths.length} career paths, ${draftReport.topStrengths.length} strengths, ${draftReport.hiddenTalents.length} hidden talents`,
    confidenceChange: 0,
    durationMs: Date.now() - step1Start,
  });

  // --- Step 2: Self-Critique ---
  const step2Start = Date.now();
  const critiquePrompt = `${REPORT_CRITIQUE_PROMPT}

=== REPORT TO CRITIQUE ===
${draft}

=== ORIGINAL EVIDENCE ===
${context}

Respond with JSON matching:
{
  "overallScore": 0-100,
  "sections": [{ "section": "string", "evidenceQuality": 0-100, "issues": ["string"], "suggestedFix": "string" }],
  "contradictions": ["string"],
  "unsupportedClaims": ["string"],
  "lowConfidenceMatches": ["string"]
}`;

  const critiqueText = await callGemini({
    uid,
    model: GEMINI_MODELS.FAST,
    prompt: critiquePrompt,
    feature: 'report_critique',
  });

  const critiqueJson = safeParseJson(critiqueText);
  const critique = CritiqueSchema.parse(critiqueJson);

  const weakSections = critique.sections.filter(
    (s) => s.evidenceQuality < REFINEMENT_THRESHOLD
  );

  trace.push({
    step: 2,
    name: 'Self-Critique',
    description: `Evaluated draft report for evidence quality. Overall score: ${critique.overallScore}/100.`,
    inputSummary: 'Full draft report + original evidence',
    outputSummary: `${weakSections.length} sections below threshold, ${critique.contradictions.length} contradictions, ${critique.unsupportedClaims.length} unsupported claims`,
    confidenceChange: critique.overallScore - 50,
    durationMs: Date.now() - step2Start,
  });

  // --- Step 3: Identify Refinement Targets ---
  const step3Start = Date.now();

  trace.push({
    step: 3,
    name: 'Identify Refinement Targets',
    description:
      weakSections.length > 0
        ? `Found ${weakSections.length} section(s) needing refinement: ${weakSections.map((s) => s.section).join(', ')}`
        : 'All sections passed evidence quality threshold.',
    inputSummary: `${critique.sections.length} section critiques`,
    outputSummary: `${weakSections.length} sections queued for refinement (threshold: ${REFINEMENT_THRESHOLD})`,
    confidenceChange: 0,
    durationMs: Date.now() - step3Start,
  });

  // --- Step 4: Targeted Refinement ---
  let refinedReport = draftReport;

  if (weakSections.length > 0) {
    const step4Start = Date.now();

    const refinementPrompt = `${REPORT_REFINEMENT_PROMPT}

=== CURRENT REPORT (JSON) ===
${JSON.stringify(draftReport, null, 2)}

=== SECTIONS TO IMPROVE ===
${weakSections
  .map(
    (s) =>
      `Section: ${s.section}\nEvidence Quality: ${s.evidenceQuality}/100\nIssues: ${s.issues.join('; ')}\nSuggested Fix: ${s.suggestedFix}`
  )
  .join('\n\n')}

=== CONTRADICTIONS FOUND ===
${critique.contradictions.length > 0 ? critique.contradictions.join('\n') : 'None'}

=== UNSUPPORTED CLAIMS ===
${critique.unsupportedClaims.length > 0 ? critique.unsupportedClaims.join('\n') : 'None'}

=== ORIGINAL EVIDENCE ===
${context}

Return the COMPLETE improved report as JSON (same schema as the original), with the weak sections fixed, contradictions resolved, and unsupported claims either evidenced or removed.`;

    const refinedText = await callGemini({
      uid,
      model: GEMINI_MODELS.DEEP,
      prompt: refinementPrompt,
      feature: 'report_refine',
    });

    const refinedJson = safeParseJson(refinedText);
    refinedReport = TalentReportSchema.parse(refinedJson);

    trace.push({
      step: 4,
      name: 'Targeted Refinement',
      description: `Refined ${weakSections.length} weak section(s) with deeper evidence grounding.`,
      inputSummary: `Draft report + ${weakSections.length} critique targets + original evidence`,
      outputSummary: `Refined report: ${refinedReport.careerPaths.length} career paths, ${refinedReport.topStrengths.length} strengths`,
      confidenceChange: 10,
      durationMs: Date.now() - step4Start,
    });
  }

  // --- Step 5: Final Validation ---
  const step5Start = Date.now();

  const validationPrompt = `${REPORT_VALIDATION_PROMPT}

=== REPORT TO VALIDATE ===
${JSON.stringify(refinedReport, null, 2)}

=== ORIGINAL EVIDENCE ===
${context}

Respond with JSON:
{
  "isValid": true/false,
  "issues": ["string"],
  "overallConfidence": 0-100
}`;

  const validationText = await callGemini({
    uid,
    model: GEMINI_MODELS.FAST,
    prompt: validationPrompt,
    feature: 'report_validate',
  });

  const validationJson = safeParseJson(validationText) as {
    isValid: boolean;
    issues: string[];
    overallConfidence: number;
  };

  trace.push({
    step: 5,
    name: 'Final Validation',
    description: validationJson.isValid
      ? `Report validated successfully. Confidence: ${validationJson.overallConfidence}%.`
      : `Validation found ${validationJson.issues.length} remaining issue(s).`,
    inputSummary: 'Refined report + original evidence',
    outputSummary: `Valid: ${validationJson.isValid}, Confidence: ${validationJson.overallConfidence}%, Issues: ${validationJson.issues.length}`,
    confidenceChange: validationJson.overallConfidence - critique.overallScore,
    durationMs: Date.now() - step5Start,
  });

  return { report: refinedReport, trace };
}

// --- Helper: Gemini call wrapper ---

async function callGemini(params: {
  uid: string;
  model: GeminiModelId;
  prompt: string;
  feature: string;
}): Promise<string> {
  const { uid, model, prompt, feature } = params;

  const { client, keySource } = await getGeminiClientForUser({
    uid,
    model,
  });

  const response = await client.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) {
    throw new GeminiError(`${feature}: Gemini returned empty response`);
  }

  await trackGeminiUsage({
    uid,
    model,
    feature,
    keySource,
    inputChars: prompt.length,
    outputChars: text.length,
  });

  return text;
}
