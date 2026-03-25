import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "./EventEmitter";

describe("EventEmitter", () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  it("should register and emit events", () => {
    const mockCallback = vi.fn();
    // Use an arbitrary string cast as event for testing since actual events depend on HermesEvents
    emitter.on("message:new" as any, mockCallback);

    emitter.emit("message:new" as any, { id: 1, text: "Hello" });
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({ id: 1, text: "Hello" });
  });

  it("should chain on and emit calls", () => {
    const mockCallback = vi.fn();
    emitter.on("typing:started" as any, mockCallback).emit("typing:started" as any, "user1");
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("user1");
  });

  it("should remove specific listeners with off", () => {
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();

    emitter.on("room:updated" as any, mockCallback1);
    emitter.on("room:updated" as any, mockCallback2);

    expect(emitter.listenerCount("room:updated" as any)).toBe(2);

    emitter.off("room:updated" as any, mockCallback1);
    
    expect(emitter.listenerCount("room:updated" as any)).toBe(1);

    emitter.emit("room:updated" as any, { roomId: "1" });

    expect(mockCallback1).not.toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });

  it("should only call 'once' listeners a single time", () => {
    const mockCallback = vi.fn();
    emitter.once("user:online" as any, mockCallback);

    emitter.emit("user:online" as any, "user1");
    emitter.emit("user:online" as any, "user1");

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(emitter.listenerCount("user:online" as any)).toBe(0);
  });

  it("should remove all listeners for a specific event", () => {
    const mockCallback = vi.fn();
    emitter.on("error" as any, mockCallback);
    emitter.on("error" as any, mockCallback);
    
    emitter.removeAllListeners("error" as any);
    
    expect(emitter.listenerCount("error" as any)).toBe(0);
  });

  it("should remove all listeners across all events", () => {
    emitter.on("event1" as any, vi.fn());
    emitter.on("event2" as any, vi.fn());

    emitter.removeAllListeners();

    expect(emitter.listenerCount("event1" as any)).toBe(0);
    expect(emitter.listenerCount("event2" as any)).toBe(0);
  });

  it("should return the correct listener count", () => {
    expect(emitter.listenerCount("test" as any)).toBe(0);
    emitter.on("test" as any, vi.fn());
    expect(emitter.listenerCount("test" as any)).toBe(1);
    emitter.on("test" as any, vi.fn());
    expect(emitter.listenerCount("test" as any)).toBe(2);
  });
});
