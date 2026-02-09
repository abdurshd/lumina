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
import { SaveInsightFunctionDeclaration, FetchUserProfileDeclaration, SaveSignalDeclaration, StartQuizModuleDeclaration, ScheduleNextStepDeclaration, EvaluateConfidenceDeclaration, LogAgentReasoningDeclaration } from "@/lib/schemas/session";
import type { SessionInsight, UserSignal, QuizModuleId, ConfidenceProfile } from "@/types";
import { normalizeSessionInsightCategory } from "@/lib/psychometrics/dimension-model";

export interface NextStepSuggestion {
  title: string;
  description: string;
  timeframe: string;
}

export interface AgentReasoningEntry {
  action: string;
  reason: string;
  targetDimension?: string;
  confidenceImpact?: number;
  timestamp: number;
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
  onConfidenceRequested?: () => ConfidenceProfile | null;
  onAgentReasoning?: (entry: AgentReasoningEntry) => void;
}

const MAX_RECONNECT_RETRIES = 5;
const RECONNECT_BASE_DELAY_MS = 1000;
const CONTEXT_TOKEN_THRESHOLD = 65_000;
const CHARS_PER_TOKEN = 4;

export class LiveSessionManager {
  private session: Session | null = null;
  private callbacks: LiveSessionCallbacks;
  private insights: SessionInsight[] = [];
  private sessionHandle: string | null = null;
  private apiKey: string | null = null;
  private apiVersion: 'v1alpha' | 'v1' = 'v1alpha';
  private dataContext: string | null = null;
  private confidenceProfile: ConfidenceProfile | null = null;
  private transcriptCharCount = 0;
  private isReconnecting = false;
  private manualDisconnect = false;
  private pendingUserTurns: string[] = [];
  private _connected = false;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(
    authToken: string,
    dataContext: string,
    apiVersion: 'v1alpha' | 'v1' = 'v1alpha',
    confidenceProfile?: ConfidenceProfile
  ): Promise<void> {
    this.apiKey = authToken;
    this.dataContext = dataContext;
    this.apiVersion = apiVersion;
    this.confidenceProfile = confidenceProfile ?? null;
    this.manualDisconnect = false;

    // Build confidence-aware system instruction
    let confidenceContext = "";
    if (confidenceProfile && Object.keys(confidenceProfile.dimensions).length > 0) {
      const dimLines = Object.entries(confidenceProfile.dimensions)
        .map(([dim, dc]) => `  ${dim}: ${dc.confidence}% (sources: ${dc.sourceTypes.join(", ")})`)
        .join("\n");
      const highConfDims = Object.entries(confidenceProfile.dimensions)
        .filter(([, dc]) => dc.confidence >= 70)
        .map(([dim]) => dim);
      const lowConfDims = Object.entries(confidenceProfile.dimensions)
        .filter(([, dc]) => dc.confidence < 40)
        .map(([dim]) => dim);

      confidenceContext = `\n\nDIMENSION CONFIDENCE PROFILE (overall: ${confidenceProfile.overallConfidence}%):\n${dimLines}`;
      if (highConfDims.length > 0) {
        confidenceContext += `\n\nHIGH CONFIDENCE (can skip): ${highConfDims.join(", ")}`;
      }
      if (lowConfDims.length > 0) {
        confidenceContext += `\nLOW CONFIDENCE (prioritize probing): ${lowConfDims.join(", ")}`;
      }
    }

    try {
      const client = new GoogleGenAI({
        apiKey: authToken,
        httpOptions: { apiVersion },
      });

      this.session = await client.live.connect({
        model: GEMINI_MODELS.LIVE,
        callbacks: {
          onopen: () => {
            this._connected = true;
            this.callbacks.onConnectionChange(true);
          },
          onmessage: (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onerror: (e: ErrorEvent) => {
            this.callbacks.onError(new Error(e.message || "WebSocket error"));
          },
          onclose: () => {
            this._connected = false;
            if (!this.isReconnecting) {
              this.callbacks.onConnectionChange(false);
              if (!this.manualDisconnect && this.apiKey && this.dataContext) {
                this.reconnect();
              }
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
                text: `${LIVE_SESSION_SYSTEM_PROMPT}${confidenceContext}\n\nCONTEXT ABOUT THIS USER (from their data analysis and quiz):\n${dataContext}`,
              },
            ],
          },
          tools: [{ functionDeclarations: [SaveInsightFunctionDeclaration, FetchUserProfileDeclaration, SaveSignalDeclaration, StartQuizModuleDeclaration, ScheduleNextStepDeclaration, EvaluateConfidenceDeclaration, LogAgentReasoningDeclaration] }],
          sessionResumption: {
            handle: this.sessionHandle ?? undefined,
          },
        },
      });
      this.flushPendingUserTurns();
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
          const normalizedCategory = normalizeSessionInsightCategory(String(args.category ?? ""));
          const parsedConfidence = Number(args.confidence ?? 0.5);
          const insight: SessionInsight = {
            timestamp: Date.now(),
            observation: String(args.observation ?? ""),
            category: normalizedCategory ?? 'engagement',
            confidence: Number.isFinite(parsedConfidence)
              ? Math.max(0, Math.min(1, parsedConfidence))
              : 0.5,
            evidence: String(args.evidence ?? ""),
            dimension: args.dimension ? String(args.dimension) : undefined,
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
        } else if (fc.name === "evaluateConfidence") {
          // Return current confidence profile to the model
          const profile = this.callbacks.onConfidenceRequested?.() ?? this.confidenceProfile;
          if (profile) {
            const dimSummary = Object.entries(profile.dimensions)
              .map(([dim, dc]) => `${dim}: ${dc.confidence}%`)
              .join(", ");
            this.session?.sendToolResponse({
              functionResponses: [{
                id: fc.id!,
                response: {
                  overallConfidence: profile.overallConfidence,
                  dimensions: dimSummary,
                  lastUpdated: profile.lastUpdated,
                },
              }],
            });
          } else {
            this.session?.sendToolResponse({
              functionResponses: [{
                id: fc.id!,
                response: { error: "Confidence profile not available yet" },
              }],
            });
          }
        } else if (fc.name === "logAgentReasoning") {
          const entry: AgentReasoningEntry = {
            action: String(args.action ?? ""),
            reason: String(args.reason ?? ""),
            targetDimension: args.targetDimension ? String(args.targetDimension) : undefined,
            confidenceImpact: typeof args.confidenceImpact === "number" ? args.confidenceImpact : undefined,
            timestamp: Date.now(),
          };
          this.callbacks.onAgentReasoning?.(entry);
          this.session?.sendToolResponse({
            functionResponses: [{ id: fc.id!, response: { success: true, message: "Reasoning logged" } }],
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
      const jitter = 0.8 + (Math.random() * 0.4);
      const delay = Math.round(RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1) * jitter);
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        await this.connect(this.apiKey, this.dataContext, this.apiVersion);
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

  get connected(): boolean {
    return this._connected;
  }

  sendAudio(base64Audio: string): void {
    if (!this.session || !this._connected) return;
    try {
      this.session.sendRealtimeInput({
        media: {
          data: base64Audio,
          mimeType: "audio/pcm;rate=16000",
        },
      });
    } catch {
      // WebSocket already closed — suppress
    }
  }

  sendVideo(base64Image: string): void {
    if (!this.session || !this._connected) return;
    try {
      this.session.sendRealtimeInput({
        media: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      });
    } catch {
      // WebSocket already closed — suppress
    }
  }

  sendText(text: string): void {
    if (!this.session || !this._connected) {
      this.pendingUserTurns.push(text);
      return;
    }
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
    this.manualDisconnect = true;
    this._connected = false;
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

  private flushPendingUserTurns(): void {
    if (!this.session || !this._connected) return;
    if (this.pendingUserTurns.length === 0) return;

    const queued = [...this.pendingUserTurns];
    this.pendingUserTurns = [];
    for (const text of queued) {
      this.session.sendClientContent({
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      });
      this.callbacks.onTranscript(text, true);
      this.transcriptCharCount += text.length;
    }
  }
}
