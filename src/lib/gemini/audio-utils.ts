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

export class AudioPlaybackManager {
  private audioContext: AudioContext;
  private queue: Float32Array[] = [];
  private isPlaying = false;
  private nextStartTime = 0;

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
  }

  enqueue(audioData: Float32Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const data = this.queue.shift()!;
    const buffer = this.audioContext.createBuffer(1, data.length, 24000);
    buffer.getChannelData(0).set(data);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;

    source.onended = () => this.playNext();
  }

  stop() {
    this.queue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }

  async resume() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  close() {
    this.stop();
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
    this.bufferSize = 4096;
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
