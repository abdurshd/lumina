import { google } from 'googleapis';
import type { IngestionPayload } from '@/lib/data/ingestion';

export async function fetchDriveData(accessToken: string): Promise<IngestionPayload> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  // List recent Google Docs
  const listRes = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document' and trashed=false",
    orderBy: 'modifiedTime desc',
    pageSize: 50,
    fields: 'files(id, name, modifiedTime)',
  });

  const files = listRes.data.files ?? [];
  if (files.length === 0) {
    throw new Error('No Google Docs found in your Drive.');
  }

  const chunks: string[] = [];
  let skippedCount = 0;
  for (const file of files) {
    if (!file.id) continue;
    try {
      const exportRes = await drive.files.export({
        fileId: file.id,
        mimeType: 'text/plain',
      });
      const text = typeof exportRes.data === 'string' ? exportRes.data : String(exportRes.data);
      if (text.trim()) {
        chunks.push(`--- ${file.name} (${file.modifiedTime}) ---\n${text}`);
      }
    } catch {
      // Skip files that can't be exported
      skippedCount += 1;
    }
  }

  if (chunks.length === 0) {
    throw new Error('Could not export any Google Docs content.');
  }

  const parseQuality = skippedCount > 12 ? 'medium' : 'high';
  return {
    data: chunks.join('\n\n'),
    itemCount: chunks.length,
    parseQuality,
    warnings: skippedCount > 0 ? [`Skipped ${skippedCount} documents that could not be exported.`] : [],
  };
}
