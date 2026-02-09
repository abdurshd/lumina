import { google } from 'googleapis';
import type { IngestionPayload } from '@/lib/data/ingestion';

export async function fetchGmailData(accessToken: string): Promise<IngestionPayload> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  // Fetch last 100 sent emails
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 100,
    q: 'in:sent',
  });

  const messages = data.messages ?? [];
  const emailTexts: string[] = [];
  let skippedCount = 0;

  // Fetch first 50 email contents (to stay within limits)
  for (const msg of messages.slice(0, 50)) {
    try {
      const { data: detail } = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['Subject', 'To'],
      });

      const subject = detail.payload?.headers?.find((h) => h.name === 'Subject')?.value ?? '';
      const snippet = detail.snippet ?? '';
      emailTexts.push(`Subject: ${subject}\nSnippet: ${snippet}`);
    } catch {
      // Skip failed messages
      skippedCount += 1;
    }
  }

  const successCount = emailTexts.length;
  const parseQuality = skippedCount > 10 ? 'medium' : 'high';

  return {
    data: emailTexts.join('\n---\n'),
    itemCount: successCount,
    parseQuality,
    warnings: skippedCount > 0 ? [`Skipped ${skippedCount} messages that could not be read.`] : [],
  };
}
