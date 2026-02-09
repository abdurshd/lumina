import { Client } from '@notionhq/client';
import type { IngestionPayload } from '@/lib/data/ingestion';

export async function fetchNotionData(accessToken: string): Promise<IngestionPayload> {
  const notion = new Client({ auth: accessToken });

  // Search for recent pages
  const searchRes = await notion.search({
    filter: { property: 'object', value: 'page' },
    sort: { direction: 'descending', timestamp: 'last_edited_time' },
    page_size: 50,
  });

  const pages = searchRes.results;
  if (pages.length === 0) {
    throw new Error('No Notion pages found.');
  }

  const chunks: string[] = [];
  let skippedCount = 0;
  for (const page of pages) {
    if (page.object !== 'page') continue;
    try {
      const title = extractPageTitle(page);
      const blocks = await notion.blocks.children.list({
        block_id: page.id,
        page_size: 100,
      });
      const text = blocks.results
        .map(extractBlockText)
        .filter(Boolean)
        .join('\n');
      if (text.trim()) {
        chunks.push(`--- ${title} ---\n${text}`);
      }
    } catch {
      // Skip pages that can't be read
      skippedCount += 1;
    }
  }

  if (chunks.length === 0) {
    throw new Error('Could not extract any Notion page content.');
  }

  const parseQuality = skippedCount > 12 ? 'medium' : 'high';
  return {
    data: chunks.join('\n\n'),
    itemCount: chunks.length,
    parseQuality,
    warnings: skippedCount > 0 ? [`Skipped ${skippedCount} pages that could not be read.`] : [],
  };
}

function extractPageTitle(page: Record<string, unknown>): string {
  const properties = page.properties as Record<string, unknown> | undefined;
  if (!properties) return 'Untitled';

  for (const prop of Object.values(properties)) {
    const p = prop as Record<string, unknown>;
    if (p.type === 'title' && Array.isArray(p.title)) {
      const texts = (p.title as Array<{ plain_text?: string }>)
        .map((t) => t.plain_text ?? '')
        .join('');
      if (texts) return texts;
    }
  }
  return 'Untitled';
}

function extractBlockText(block: Record<string, unknown>): string {
  const type = block.type as string;
  const content = block[type] as Record<string, unknown> | undefined;
  if (!content) return '';

  const richText = content.rich_text as Array<{ plain_text?: string }> | undefined;
  if (richText) {
    return richText.map((t) => t.plain_text ?? '').join('');
  }

  return '';
}
