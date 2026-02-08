import { google } from 'googleapis';

export async function fetchGmailData(accessToken: string): Promise<string> {
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
    }
  }

  return emailTexts.join('\n---\n');
}
