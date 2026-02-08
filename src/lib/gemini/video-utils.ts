/**
 * Video utilities for Gemini Live API
 * Captures webcam frames at ~1 FPS as JPEG base64
 */

export class FrameCapturer {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onFrame: (base64: string) => void;
  private fps: number;

  constructor(video: HTMLVideoElement, onFrame: (base64: string) => void, fps: number = 1) {
    this.video = video;
    this.onFrame = onFrame;
    this.fps = fps;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 768;
    this.canvas.height = 768;
    this.ctx = this.canvas.getContext('2d')!;
  }

  start() {
    this.capture(); // Capture immediately
    this.intervalId = setInterval(() => this.capture(), 1000 / this.fps);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private capture() {
    if (this.video.readyState < 2) return;

    const vw = this.video.videoWidth;
    const vh = this.video.videoHeight;
    const size = Math.min(vw, vh);
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    this.ctx.drawImage(this.video, sx, sy, size, size, 0, 0, 768, 768);
    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.7);
    const base64 = dataUrl.split(',')[1];
    this.onFrame(base64);
  }
}
