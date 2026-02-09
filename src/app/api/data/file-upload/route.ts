import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { parseUploadedFile, isSupportedMimeType } from '@/lib/data/file-upload';
import { buildIngestionResponse } from '@/lib/data/ingestion';
import { hasSourceConsent } from '@/lib/data/consent';
import { getGeminiClientForUser } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { trackGeminiUsage } from '@/lib/gemini/byok';
import { analyzeDataSource } from '@/lib/agent/data-analyzer';
import type { ConfidenceProfile } from '@/types';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const consented = await hasSourceConsent(authResult.uid, 'file_upload');
  if (!consented) {
    return errorResponse(
      'File upload consent not granted. Enable this source in onboarding or settings first.',
      ErrorCode.FORBIDDEN,
      403,
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse('Invalid form data', ErrorCode.BAD_REQUEST, 400);
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return errorResponse('Missing file in form data', ErrorCode.VALIDATION_ERROR, 400);
  }

  const mimeType = file.type || 'text/plain';
  if (!isSupportedMimeType(mimeType)) {
    return errorResponse(
      `Unsupported file type: ${mimeType}. Supported: PDF, TXT, Markdown, HTML.`,
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  const maxSize = mimeType === 'application/pdf' ? MAX_PDF_SIZE : MAX_TEXT_SIZE;
  if (file.size > maxSize) {
    return errorResponse(
      `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is ${Math.round(maxSize / 1024 / 1024)}MB.`,
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let payload;
    if (mimeType === 'application/pdf') {
      const { client, keySource } = await getGeminiClientForUser({
        uid: authResult.uid,
        model: GEMINI_MODELS.FAST,
      });
      payload = await parseUploadedFile(buffer, mimeType, { client });
      await trackGeminiUsage({
        uid: authResult.uid,
        model: GEMINI_MODELS.FAST,
        feature: 'file_upload_pdf_extract',
        keySource,
        inputChars: buffer.length,
        outputChars: payload.data.length,
      });
    } else {
      payload = await parseUploadedFile(buffer, mimeType);
    }

    const ingestion = buildIngestionResponse('file_upload', payload);

    let agentAnalysis = null;
    try {
      let existingProfile: ConfidenceProfile = {
        dimensions: {},
        overallConfidence: 0,
        lastUpdated: Date.now(),
      };
      const profileField = formData.get('confidenceProfile');
      if (typeof profileField === 'string') {
        try {
          existingProfile = JSON.parse(profileField) as ConfidenceProfile;
        } catch { /* use default */ }
      }
      agentAnalysis = await analyzeDataSource({
        uid: authResult.uid,
        source: 'file_upload',
        rawData: ingestion.data,
        existingProfile,
      });
    } catch (err) {
      console.error('[File Upload Agent Analysis]', err instanceof Error ? err.message : err);
    }

    return NextResponse.json({ ...ingestion, agentAnalysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process file';
    console.error('[File Upload Error]', message);
    return errorResponse(message, ErrorCode.INTERNAL_ERROR, 500);
  }
}
