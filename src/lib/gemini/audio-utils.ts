/**
 * Audio utilities for Gemini Live API
 * Input: 16kHz 16-bit PCM mono
 * Output: 24kHz PCM from Gemini
 */

export function float32ToPcm16Base64(float32Array: Float32Array): string {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 0x8000;
  }
  return float32;
}

const OUTPUT_SAMPLE_RATE = 24000;
const PLAYBACK_SCHEDULE_AHEAD_SECONDS = 0.2;
const PLAYBACK_INITIAL_BUFFER_SECONDS = 0.1;
const PLAYBACK_RESCHEDULE_EARLY_SECONDS = 0.05;

export class AudioPlaybackManager {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private queue: Float32Array[] = [];
  private scheduledTime = 0;
  private isScheduling = false;
  private scheduleTimer: ReturnType<typeof setTimeout> | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  enqueue(audioData: Float32Array) {
    if (audioData.length === 0) return;
    this.queue.push(audioData);
    this.ensureScheduling();
  }

  private ensureScheduling() {
    if (!this.isScheduling) {
      this.isScheduling = true;
      this.scheduledTime = Math.max(
        this.audioContext.currentTime + PLAYBACK_INITIAL_BUFFER_SECONDS,
        this.scheduledTime,
      );
    }

    this.scheduleAvailableChunks();
    this.scheduleNextTick();
  }

  private scheduleAvailableChunks() {
    const now = this.audioContext.currentTime;
    if (this.scheduledTime < now) {
      this.scheduledTime = now + PLAYBACK_INITIAL_BUFFER_SECONDS;
    }

    while (
      this.queue.length > 0 &&
      this.scheduledTime < now + PLAYBACK_SCHEDULE_AHEAD_SECONDS
    ) {
      const data = this.queue.shift()!;
      const buffer = this.audioContext.createBuffer(
        1,
        data.length,
        OUTPUT_SAMPLE_RATE,
      );
      buffer.getChannelData(0).set(data);

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode);
      source.start(this.scheduledTime);

      this.activeSources.add(source);
      source.onended = () => {
        this.activeSources.delete(source);
      };

      this.scheduledTime += buffer.duration;
    }
  }

  private scheduleNextTick() {
    if (this.scheduleTimer) {
      clearTimeout(this.scheduleTimer);
      this.scheduleTimer = null;
    }

    if (!this.isScheduling) {
      return;
    }

    const now = this.audioContext.currentTime;
    if (this.queue.length === 0 && this.scheduledTime <= now) {
      this.isScheduling = false;
      return;
    }

    const secondsUntilReschedule = Math.max(
      0.01,
      this.scheduledTime - now - PLAYBACK_RESCHEDULE_EARLY_SECONDS,
    );

    this.scheduleTimer = setTimeout(() => {
      this.scheduleAvailableChunks();
      this.scheduleNextTick();
    }, Math.round(secondsUntilReschedule * 1000));
  }

  stop() {
    this.queue = [];
    this.isScheduling = false;
    this.scheduledTime = this.audioContext.currentTime;
    if (this.scheduleTimer) {
      clearTimeout(this.scheduleTimer);
      this.scheduleTimer = null;
    }
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Ignore already-ended source nodes.
      }
      source.disconnect();
    }
    this.activeSources.clear();
  }

  async resume() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  close() {
    this.stop();
    this.gainNode.disconnect();
    this.audioContext.close();
  }

  getAnalyserNode(): AnalyserNode {
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    return analyser;
  }
}

export const AUDIO_WORKLET_PROCESSOR = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length === 0) return true;

    const channelData = input[0];
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.bufferIndex++] = channelData[i];
      if (this.bufferIndex >= this.bufferSize) {
        this.port.postMessage({ audioData: this.buffer.slice() });
        this.bufferIndex = 0;
      }
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
`;
