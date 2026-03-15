import type { HermesEvents } from "../types/index";
type EventKey = keyof HermesEvents;
type EventCallback<K extends EventKey> = HermesEvents[K];
export declare class EventEmitter {
    private listeners;
    on<K extends EventKey>(event: K, callback: EventCallback<K>): this;
    off<K extends EventKey>(event: K, callback: EventCallback<K>): this;
    once<K extends EventKey>(event: K, callback: EventCallback<K>): this;
    emit<K extends EventKey>(event: K, ...args: Parameters<EventCallback<K>>): this;
    removeAllListeners<K extends EventKey>(event?: K): this;
    listenerCount<K extends EventKey>(event: K): number;
}
export {};
//# sourceMappingURL=EventEmitter.d.ts.map