interface ChatGPTConversation {
  title: string;
  mapping: Record<string, {
    message?: {
      author: { role: string };
      content: { parts?: string[] };
    };
  }>;
}

export function parseChatGPTExport(jsonContent: string): string {
  try {
    const conversations: ChatGPTConversation[] = JSON.parse(jsonContent);
    const summaries: string[] = [];

    // Take last 50 conversations
    const recent = conversations.slice(-50);

    for (const conv of recent) {
      const title = conv.title || 'Untitled';
      const messages: string[] = [];

      for (const node of Object.values(conv.mapping)) {
        if (node.message?.author?.role === 'user' && node.message.content.parts) {
          const text = node.message.content.parts.join(' ').slice(0, 500);
          if (text.trim()) messages.push(text);
        }
      }

      if (messages.length > 0) {
        summaries.push(`Topic: ${title}\nUser messages: ${messages.slice(0, 5).join(' | ')}`);
      }
    }

    return summaries.join('\n---\n');
  } catch {
    throw new Error('Invalid ChatGPT export format. Please upload a valid conversations.json file.');
  }
}
