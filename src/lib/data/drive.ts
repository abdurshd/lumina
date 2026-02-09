import { google } from 'googleapis';

export async function fetchDriveData(accessToken: string): Promise<string> {
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
    }
  }

  if (chunks.length === 0) {
    throw new Error('Could not export any Google Docs content.');
  }

  return chunks.join('\n\n');
}
