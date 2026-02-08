/**
 * Gemini Live API WebSocket Manager
 * Uses @google/genai SDK - callback-based LiveConnectParameters
 */

import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai';
import { LIVE_SESSION_SYSTEM_PROMPT } from './prompts';
import { SaveInsightFunctionDeclaration } from '@/lib/schemas/session';
import type { SessionInsight } from '@/types';

export interface LiveSessionCallbacks {
  onAudioData: (base64Audio: string) => void;
  onTranscript: (text: string, isUser: boolean) => void;
  onInsight: (insight: SessionInsight) => void;
  onError: (error: Error) => void;
  onConnectionChange: (connected: boolean) => void;
  onInterrupted: () => void;
}

export class LiveSessionManager {
  private session: Session | null = null;
  private callbacks: LiveSessionCallbacks;
  private insights: SessionInsight[] = [];

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(apiKey: string, dataContext: string): Promise<void> {
    try {
      const client = new GoogleGenAI({ apiKey });

      this.session = await client.live.connect({
        model: 'gemini-live-2.5-flash-preview',
        callbacks: {
          onopen: () => {
            this.callbacks.onConnectionChange(true);
          },
          onmessage: (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onerror: (e: ErrorEvent) => {
            this.callbacks.onError(new Error(e.message || 'WebSocket error'));
          },
          onclose: () => {
            this.callbacks.onConnectionChange(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede',
              },
            },
          },
          systemInstruction: {
            parts: [
              {
                text: `${LIVE_SESSION_SYSTEM_PROMPT}\n\nCONTEXT ABOUT THIS USER (from their data analysis and quiz):\n${dataContext}`,
              },
            ],
          },
          tools: [{ functionDeclarations: [SaveInsightFunctionDeclaration] }],
        },
      });
    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private handleMessage(message: LiveServerMessage): void {
    // Handle tool calls
    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls ?? []) {
        if (fc.name === 'saveInsight') {
          const args = fc.args as Record<string, unknown>;
          const insight: SessionInsight = {
            timestamp: Date.now(),
            observation: String(args.observation ?? ''),
            category: args.category as SessionInsight['category'],
            confidence: Number(args.confidence ?? 0.5),
          };
          this.insights.push(insight);
          this.callbacks.onInsight(insight);

          // Send function response
          this.session?.sendToolResponse({
            functionResponses: [
              { id: fc.id!, response: { success: true } },
            ],
          });
        }
      }
    }

    // Handle server content
    if (message.serverContent) {
      const parts = message.serverContent.modelTurn?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          this.callbacks.onAudioData(part.inlineData.data);
        }
        if (part.text) {
          this.callbacks.onTranscript(part.text, false);
        }
      }

      if (message.serverContent.interrupted) {
        this.callbacks.onInterrupted();
      }
    }
  }

  sendAudio(base64Audio: string): void {
    if (!this.session) return;
    try {
      this.session.sendRealtimeInput({
        media: {
          data: base64Audio,
          mimeType: 'audio/pcm;rate=16000',
        },
      });
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  }

  sendVideo(base64Image: string): void {
    if (!this.session) return;
    try {
      this.session.sendRealtimeInput({
        media: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      });
    } catch (error) {
      console.error('Error sending video:', error);
    }
  }

  sendText(text: string): void {
    if (!this.session) return;
    this.session.sendClientContent({
      turns: [{ role: 'user', parts: [{ text }] }],
      turnComplete: true,
    });
    this.callbacks.onTranscript(text, true);
  }

  getInsights(): SessionInsight[] {
    return [...this.insights];
  }

  disconnect(): void {
    if (this.session) {
      try {
        this.session.close();
      } catch {
        // Ignore close errors
      }
      this.session = null;
      this.callbacks.onConnectionChange(false);
    }
  }
}
