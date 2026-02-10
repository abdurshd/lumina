import type { IngestionPayload } from '@/lib/data/ingestion';

interface GeminiConversation {
  title?: string;
  messages?: { role: string; text?: string; parts?: { text?: string }[] }[];
  // Alternative format from Gemini activity export
  textInput?: string;
  response?: string;
}

export function parseGeminiExport(jsonContent: string): IngestionPayload {
  try {
    const parsed: GeminiConversation[] | Record<string, GeminiConversation[]> = JSON.parse(jsonContent);

    // Normalize: Gemini exports can be an array or an object with conversation arrays
    const conversations: GeminiConversation[] = Array.isArray(parsed)
      ? parsed
      : Object.values(parsed).flat();

    const summaries: string[] = [];
    const recent = conversations.slice(-50);

    for (const conv of recent) {
      const title = conv.title || 'Untitled';
      const messages: string[] = [];

      // Format 1: messages array with role/text
      if (Array.isArray(conv.messages)) {
        for (const msg of conv.messages) {
          if (msg.role === 'user') {
            const text = msg.text ?? msg.parts?.map((p) => p.text).join(' ') ?? '';
            if (text.trim()) messages.push(text.slice(0, 500));
          }
        }
      }

      // Format 2: simple textInput/response pairs
      if (conv.textInput && typeof conv.textInput === 'string') {
        messages.push(conv.textInput.slice(0, 500));
      }

      if (messages.length > 0) {
        summaries.push(`Topic: ${title}\nUser messages: ${messages.slice(0, 5).join(' | ')}`);
      }
    }

    const parseQuality = summaries.length >= 10 ? 'high' : summaries.length >= 3 ? 'medium' : 'low';
    return {
      data: summaries.join('\n---\n'),
      itemCount: summaries.length,
      parseQuality,
    };
  } catch {
    throw new Error('Invalid Gemini export format. Please upload a valid JSON export of your Gemini conversations.');
  }
}
