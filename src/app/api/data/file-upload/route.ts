import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { parseUploadedFile, isSupportedMimeType } from '@/lib/data/file-upload';
import { buildIngestionResponse } from '@/lib/data/ingestion';
import { hasSourceConsent } from '@/lib/data/consent';

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
    const payload = await parseUploadedFile(buffer, mimeType);
    return NextResponse.json(buildIngestionResponse('file_upload', payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process file';
    console.error('[File Upload Error]', message);
    return errorResponse(message, ErrorCode.INTERNAL_ERROR, 500);
  }
}
