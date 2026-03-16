import type { HermesClient } from "../core/HermesClient";
import type { TypingEvent } from "../types/index";

export class Typing {
  
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private AUTO_STOP_MS = 3000;

  constructor(private client: HermesClient) {}

  
  start(roomId: string): void {
    this.client.startTyping(roomId);

    
    const existing = this.timeouts.get(roomId);
    if (existing) clearTimeout(existing);

    
    const timeout = setTimeout(() => {
      this.stop(roomId);
    }, this.AUTO_STOP_MS);

    this.timeouts.set(roomId, timeout);
  }

  
  stop(roomId: string): void {
    this.client.stopTyping(roomId);
    const existing = this.timeouts.get(roomId);
    if (existing) {
      clearTimeout(existing);
      this.timeouts.delete(roomId);
    }
  }

  
  onTypingStart(callback: (event: TypingEvent) => void): () => void {
    this.client.on("typing:started", callback);
    return () => this.client.off("typing:started", callback);
  }

  
  onTypingStop(callback: (event: TypingEvent) => void): () => void {
    this.client.on("typing:stopped", callback);
    return () => this.client.off("typing:stopped", callback);
  }
}
