/**
 * Gemini Live API WebSocket Manager
 * Uses @google/genai SDK - callback-based LiveConnectParameters
 */

import {
  GoogleGenAI,
  Modality,
  type Session,
  type LiveServerMessage,
} from "@google/genai";
import { GEMINI_MODELS } from "./models";
import { LIVE_SESSION_SYSTEM_PROMPT } from "./prompts";
import { SaveInsightFunctionDeclaration, FetchUserProfileDeclaration, SaveSignalDeclaration, StartQuizModuleDeclaration, ScheduleNextStepDeclaration } from "@/lib/schemas/session";
import type { SessionInsight, UserSignal, QuizModuleId } from "@/types";

export interface NextStepSuggestion {
  title: string;
  description: string;
  timeframe: string;
}

export interface LiveSessionCallbacks {
  onAudioData: (base64Audio: string) => void;
  onTranscript: (text: string, isUser: boolean) => void;
  onInsight: (insight: SessionInsight) => void;
  onError: (error: Error) => void;
  onConnectionChange: (connected: boolean) => void;
  onInterrupted: () => void;
  onReconnecting?: (attempt: number) => void;
  onSignal?: (signal: UserSignal) => void;
  onProfileRequested?: () => Promise<string>;
  onQuizModuleSuggested?: (moduleId: QuizModuleId, reason: string) => void;
  onNextStepScheduled?: (step: NextStepSuggestion) => void;
}

const MAX_RECONNECT_RETRIES = 3;
const RECONNECT_BASE_DELAY_MS = 1000;
const CONTEXT_TOKEN_THRESHOLD = 80_000;
const CHARS_PER_TOKEN = 4;

export class LiveSessionManager {
  private session: Session | null = null;
  private callbacks: LiveSessionCallbacks;
  private insights: SessionInsight[] = [];
  private sessionHandle: string | null = null;
  private apiKey: string | null = null;
  private dataContext: string | null = null;
  private transcriptCharCount = 0;
  private isReconnecting = false;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(apiKey: string, dataContext: string): Promise<void> {
    this.apiKey = apiKey;
    this.dataContext = dataContext;

    try {
      const client = new GoogleGenAI({ apiKey });

      this.session = await client.live.connect({
        model: GEMINI_MODELS.LIVE,
        callbacks: {
          onopen: () => {
            this.callbacks.onConnectionChange(true);
          },
          onmessage: (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onerror: (e: ErrorEvent) => {
            this.callbacks.onError(new Error(e.message || "WebSocket error"));
          },
          onclose: () => {
            if (!this.isReconnecting) {
              this.callbacks.onConnectionChange(false);
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede",
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
          tools: [{ functionDeclarations: [SaveInsightFunctionDeclaration, FetchUserProfileDeclaration, SaveSignalDeclaration, StartQuizModuleDeclaration, ScheduleNextStepDeclaration] }],
          sessionResumption: {
            handle: this.sessionHandle ?? undefined,
          },
        },
      });
    } catch (error) {
      this.callbacks.onError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  private handleMessage(message: LiveServerMessage): void {
    // Handle GoAway - server is signaling imminent disconnect
    if (message.goAway) {
      this.reconnect();
      return;
    }

    // Handle session resumption updates
    if (message.sessionResumptionUpdate?.newHandle) {
      this.sessionHandle = message.sessionResumptionUpdate.newHandle;
    }

    // Handle tool calls
    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls ?? []) {
        const args = fc.args as Record<string, unknown>;

        if (fc.name === "saveInsight") {
          const insight: SessionInsight = {
            timestamp: Date.now(),
            observation: String(args.observation ?? ""),
            category: args.category as SessionInsight["category"],
            confidence: Number(args.confidence ?? 0.5),
          };
          this.insights.push(insight);
          this.callbacks.onInsight(insight);
          this.session?.sendToolResponse({
            functionResponses: [{ id: fc.id!, response: { success: true } }],
          });
        } else if (fc.name === "fetchUserProfile") {
          if (this.callbacks.onProfileRequested) {
            this.callbacks.onProfileRequested().then((profileData) => {
              this.session?.sendToolResponse({
                functionResponses: [{ id: fc.id!, response: { profile: profileData } }],
              });
            }).catch(() => {
              this.session?.sendToolResponse({
                functionResponses: [{ id: fc.id!, response: { error: "Failed to fetch profile" } }],
              });
            });
          } else {
            this.session?.sendToolResponse({
              functionResponses: [{ id: fc.id!, response: { error: "Profile not available" } }],
            });
          }
        } else if (fc.name === "saveSignal") {
          const signal: UserSignal = {
            id: `signal_${Date.now()}`,
            signal: String(args.signal ?? ""),
            source: "live_session",
            evidence: String(args.evidence ?? ""),
            confidence: Number(args.confidence ?? 0.5),
            timestamp: Date.now(),
          };
          this.callbacks.onSignal?.(signal);
          this.session?.sendToolResponse({
            functionResponses: [{ id: fc.id!, response: { success: true } }],
          });
        } else if (fc.name === "startQuizModule") {
          const moduleId = String(args.moduleId ?? "") as QuizModuleId;
          const reason = String(args.reason ?? "");
          this.callbacks.onQuizModuleSuggested?.(moduleId, reason);
          this.session?.sendToolResponse({
            functionResponses: [{ id: fc.id!, response: { success: true, message: "Quiz module suggestion shown to user" } }],
          });
        } else if (fc.name === "scheduleNextStep") {
          const step: NextStepSuggestion = {
            title: String(args.title ?? ""),
            description: String(args.description ?? ""),
            timeframe: String(args.timeframe ?? ""),
          };
          this.callbacks.onNextStepScheduled?.(step);
          this.session?.sendToolResponse({
            functionResponses: [{ id: fc.id!, response: { success: true } }],
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
          this.transcriptCharCount += part.text.length;
          this.maybeCompressContext();
        }
      }

      if (message.serverContent.interrupted) {
        this.callbacks.onInterrupted();
      }
    }
  }

  private async reconnect(): Promise<void> {
    if (this.isReconnecting || !this.apiKey || !this.dataContext) return;
    this.isReconnecting = true;

    // Close existing session quietly
    if (this.session) {
      try { this.session.close(); } catch { /* ignore */ }
      this.session = null;
    }

    for (let attempt = 1; attempt <= MAX_RECONNECT_RETRIES; attempt++) {
      this.callbacks.onReconnecting?.(attempt);
      const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        await this.connect(this.apiKey, this.dataContext);
        this.isReconnecting = false;
        return;
      } catch {
        if (attempt === MAX_RECONNECT_RETRIES) {
          this.isReconnecting = false;
          this.callbacks.onConnectionChange(false);
          this.callbacks.onError(
            new Error("Session reconnection failed after maximum retries"),
          );
        }
      }
    }
  }

  private maybeCompressContext(): void {
    const approxTokens = this.transcriptCharCount / CHARS_PER_TOKEN;
    if (approxTokens >= CONTEXT_TOKEN_THRESHOLD && this.session) {
      try {
        this.session.sendClientContent({
          contextWindowCompression: { slidingWindow: {} },
        } as Parameters<Session['sendClientContent']>[0]);
        this.transcriptCharCount = 0;
      } catch (error) {
        console.error("Context compression failed:", error);
      }
    }
  }

  sendAudio(base64Audio: string): void {
    if (!this.session) return;
    try {
      this.session.sendRealtimeInput({
        media: {
          data: base64Audio,
          mimeType: "audio/pcm;rate=16000",
        },
      });
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  }

  sendVideo(base64Image: string): void {
    if (!this.session) return;
    try {
      this.session.sendRealtimeInput({
        media: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      });
    } catch (error) {
      console.error("Error sending video:", error);
    }
  }

  sendText(text: string): void {
    if (!this.session) return;
    this.session.sendClientContent({
      turns: [{ role: "user", parts: [{ text }] }],
      turnComplete: true,
    });
    this.callbacks.onTranscript(text, true);
    this.transcriptCharCount += text.length;
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
