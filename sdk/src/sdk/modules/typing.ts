import type { HermesClient } from "../core/HermesClient";
import type { TypingEvent } from "../types/index";

// ── Typing Module ─────────────────────────────────────────────────────────────
// Handles typing start/stop with auto-stop after inactivity.
// Usage:
//   const typing = new Typing(client);
//   typing.start("roomId");  // call on every keypress
//   typing.stop("roomId");   // call on blur or send

export class Typing {
  // Auto-stop timeout per room: roomId → timeout handle
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private AUTO_STOP_MS = 3000;

  constructor(private client: HermesClient) {}

  // Call on every keypress — auto stops after 3s of inactivity
  start(roomId: string): void {
    this.client.startTyping(roomId);

    // Clear existing timeout
    const existing = this.timeouts.get(roomId);
    if (existing) clearTimeout(existing);

    // Auto-stop after inactivity
    const timeout = setTimeout(() => {
      this.stop(roomId);
    }, this.AUTO_STOP_MS);

    this.timeouts.set(roomId, timeout);
  }

  // Call explicitly on send or blur
  stop(roomId: string): void {
    this.client.stopTyping(roomId);
    const existing = this.timeouts.get(roomId);
    if (existing) {
      clearTimeout(existing);
      this.timeouts.delete(roomId);
    }
  }

  // Listen for others typing in a room
  onTypingStart(callback: (event: TypingEvent) => void): () => void {
    this.client.on("typing:started", callback);
    return () => this.client.off("typing:started", callback);
  }

  // Listen for others stopping typing
  onTypingStop(callback: (event: TypingEvent) => void): () => void {
    this.client.on("typing:stopped", callback);
    return () => this.client.off("typing:stopped", callback);
  }
}
