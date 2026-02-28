import type { HermesEvents } from "../types/index";

type EventKey = keyof HermesEvents;
type EventCallback<K extends EventKey> = HermesEvents[K];
type ListenerMap = { [K in EventKey]?: EventCallback<K>[] };

// ── Typed Event Emitter ───────────────────────────────────────────────────────
// Fully typed — you can only emit/listen to events defined in HermesEvents
export class EventEmitter {
  private listeners: ListenerMap = {};

  on<K extends EventKey>(event: K, callback: EventCallback<K>): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    (this.listeners[event] as EventCallback<K>[]).push(callback);
    return this;
  }

  off<K extends EventKey>(event: K, callback: EventCallback<K>): this {
    if (!this.listeners[event]) return this;
    this.listeners[event] = (
      this.listeners[event] as EventCallback<K>[]
    ).filter((cb) => cb !== callback) as any;
    return this;
  }

  once<K extends EventKey>(event: K, callback: EventCallback<K>): this {
    const wrapper = ((...args: any[]) => {
      (callback as any)(...args);
      this.off(event, wrapper as any);
    }) as EventCallback<K>;
    return this.on(event, wrapper);
  }

  emit<K extends EventKey>(
    event: K,
    ...args: Parameters<EventCallback<K>>
  ): this {
    if (!this.listeners[event]) return this;
    (this.listeners[event] as EventCallback<K>[]).forEach((cb) =>
      (cb as any)(...args),
    );
    return this;
  }

  removeAllListeners<K extends EventKey>(event?: K): this {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
    return this;
  }

  listenerCount<K extends EventKey>(event: K): number {
    return this.listeners[event]?.length ?? 0;
  }
}
