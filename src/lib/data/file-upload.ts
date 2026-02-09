import { getGeminiClient } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import type { IngestionPayload } from '@/lib/data/ingestion';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/html',
] as const;

type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export function isSupportedMimeType(type: string): type is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(type);
}

export async function parseUploadedFile(buffer: Buffer, mimeType: string): Promise<IngestionPayload> {
  if (!isSupportedMimeType(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  if (mimeType === 'application/pdf') {
    return extractPdfText(buffer);
  }

  // Text-based files: read as UTF-8
  return {
    data: buffer.toString('utf-8'),
    itemCount: 1,
    parseQuality: 'high',
  };
}

async function extractPdfText(buffer: Buffer): Promise<IngestionPayload> {
  const client = getGeminiClient();
  const base64 = buffer.toString('base64');

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.FAST,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: 'application/pdf',
            },
          },
          {
            text: 'Extract all the text content from this PDF document. Return only the raw text, preserving structure where possible. Do not summarize or interpret.',
          },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    throw new Error('Failed to extract text from PDF');
  }
  return {
    data: text,
    itemCount: 1,
    parseQuality: 'medium',
    warnings: ['PDF text extraction may omit complex layout elements.'],
  };
}
