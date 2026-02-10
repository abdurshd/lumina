import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import {
  deleteAssessmentData,
  resetStages,
  getDataInsights,
  saveDataInsights,
  getUserProfile,
  getCorpusDocuments,
  updateUserProfile,
  disconnectNotion,
} from '@/lib/firebase/firestore';
import { removeDocumentFromCorpus } from '@/lib/gemini/file-search';
import { z } from 'zod';

const RequestSchema = z.object({
  sources: z.array(z.string()).optional(),
});

const CONNECTOR_SOURCES = ['gmail', 'drive', 'notion', 'chatgpt', 'file_upload', 'gemini_app', 'claude_app'] as const;
const ASSESSMENT_DOC_SOURCES = ['dataInsights', 'quizAnswers', 'quizScores', 'sessionInsights', 'signals', 'talentReport', 'feedback'] as const;
type ConnectorSource = (typeof CONNECTOR_SOURCES)[number];

function isConnectorSource(source: string): source is ConnectorSource {
  return (CONNECTOR_SOURCES as readonly string[]).includes(source);
}

function isAssessmentDocSource(source: string): source is (typeof ASSESSMENT_DOC_SOURCES)[number] {
  return (ASSESSMENT_DOC_SOURCES as readonly string[]).includes(source);
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid request data', ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    const requestedSources = parsed.data.sources ?? [];
    const connectorSources = requestedSources.filter(isConnectorSource);
    const assessmentDocSources = requestedSources.filter(isAssessmentDocSource);

    if (requestedSources.length === 0) {
      await deleteAssessmentData(authResult.uid);
      await resetStages(authResult.uid);
      return NextResponse.json({ success: true });
    }

    if (assessmentDocSources.length > 0) {
      await deleteAssessmentData(authResult.uid, assessmentDocSources);
    }

    if (connectorSources.length > 0) {
      await revokeConnectorSources(authResult.uid, connectorSources);
    }

    return NextResponse.json({
      success: true,
      deleted: {
        assessmentDocs: assessmentDocSources,
        connectorSources,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Delete Data Error]', message);
    return errorResponse('Failed to delete data', ErrorCode.INTERNAL_ERROR, 500);
  }
}

async function revokeConnectorSources(uid: string, sources: ConnectorSource[]): Promise<void> {
  const sourceSet = new Set(sources);
  const profile = await getUserProfile(uid);

  if (profile?.dataRetentionMode !== 'session_only') {
    const insights = await getDataInsights(uid);
    const filteredInsights = insights.filter((insight) => !sourceSet.has(insight.source));
    await saveDataInsights(uid, filteredInsights);
  }

  const nextConsentSources = (profile?.consentSources ?? []).filter((source) => !sourceSet.has(source as ConnectorSource));
  await updateUserProfile(uid, {
    consentSources: nextConsentSources,
    consentVersion: 2,
    consentTimestamp: Date.now(),
  });

  if (sourceSet.has('notion')) {
    await disconnectNotion(uid);
  }

  if (!profile?.corpusName) return;

  const corpusDocs = await getCorpusDocuments(uid);
  for (const corpusDoc of corpusDocs) {
    if (!sourceSet.has(corpusDoc.source as ConnectorSource)) continue;
    await removeDocumentFromCorpus(profile.corpusName, corpusDoc.documentName, uid, corpusDoc.id);
  }
}
