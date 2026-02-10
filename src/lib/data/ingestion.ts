export type IngestionSource = 'gmail' | 'drive' | 'notion' | 'chatgpt' | 'file_upload' | 'gemini_app' | 'claude_app';
export type ParseQuality = 'high' | 'medium' | 'low';

export interface IngestionPayload {
  data: string;
  itemCount?: number;
  parseQuality?: ParseQuality;
  warnings?: string[];
}

export interface IngestionMetadata {
  itemCount: number;
  charCount: number;
  byteSize: number;
  parseQuality: ParseQuality;
  truncated: boolean;
  truncationSummary?: string;
  warnings: string[];
}

export interface IngestionResponse {
  source: IngestionSource;
  data: string;
  tokenCount: number;
  metadata: IngestionMetadata;
}

const SOURCE_CHAR_LIMIT: Record<IngestionSource, number> = {
  gmail: 140_000,
  drive: 180_000,
  notion: 180_000,
  chatgpt: 180_000,
  file_upload: 180_000,
  gemini_app: 180_000,
  claude_app: 180_000,
};

export function buildIngestionResponse(
  source: IngestionSource,
  payload: IngestionPayload,
): IngestionResponse {
  const raw = payload.data.trim();
  const maxChars = SOURCE_CHAR_LIMIT[source];
  const truncated = raw.length > maxChars ? raw.slice(0, maxChars) : raw;
  const isTruncated = raw.length > maxChars;
  const removedChars = Math.max(0, raw.length - truncated.length);

  const metadata: IngestionMetadata = {
    itemCount: payload.itemCount ?? estimateItemCount(truncated),
    charCount: truncated.length,
    byteSize: new TextEncoder().encode(truncated).length,
    parseQuality: payload.parseQuality ?? 'medium',
    truncated: isTruncated,
    truncationSummary: isTruncated
      ? `Trimmed ${removedChars.toLocaleString()} characters to keep connector payload within limits.`
      : undefined,
    warnings: payload.warnings ?? [],
  };

  return {
    source,
    data: truncated,
    tokenCount: Math.round(truncated.length / 4),
    metadata,
  };
}

function estimateItemCount(data: string): number {
  if (!data.trim()) return 0;
  const sectionCount = data.split('\n---\n').length;
  return Math.max(1, sectionCount);
}
