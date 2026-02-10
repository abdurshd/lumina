import type { IngestionPayload } from '@/lib/data/ingestion';

interface ClaudeConversation {
  name?: string;
  uuid?: string;
  chat_messages?: { sender: string; text: string }[];
}

export function parseClaudeExport(jsonContent: string): IngestionPayload {
  try {
    const parsed: ClaudeConversation[] | Record<string, ClaudeConversation[]> = JSON.parse(jsonContent);

    // Normalize: Claude exports can be an array or nested
    const conversations: ClaudeConversation[] = Array.isArray(parsed)
      ? parsed
      : Object.values(parsed).flat();

    const summaries: string[] = [];
    const recent = conversations.slice(-50);

    for (const conv of recent) {
      const title = conv.name || 'Untitled';
      const messages: string[] = [];

      if (Array.isArray(conv.chat_messages)) {
        for (const msg of conv.chat_messages) {
          if (msg.sender === 'human' && msg.text) {
            messages.push(msg.text.slice(0, 500));
          }
        }
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
    throw new Error('Invalid Claude export format. Please upload a valid JSON export of your Claude conversations.');
  }
}
