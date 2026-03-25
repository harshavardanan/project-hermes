import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HermesClient } from "./HermesClient";
import { io } from "socket.io-client";

// Mock socket.io-client
vi.mock("socket.io-client", () => {
  const mockSocket = {
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  };
  return {
    io: vi.fn(() => mockSocket),
    Socket: vi.fn()
  };
});

describe("HermesClient", () => {
  let client: HermesClient;
  const mockEndpoint = "http://localhost:8080";

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn() as any;
  });
  
  afterEach(() => {
    if (client) {
      client.disconnect();
    }
  });

  it("should initialize with token config", () => {
    client = new HermesClient({ endpoint: mockEndpoint, token: "test-token" });
    expect(client.status).toBe("idle");
    expect(client.isConnected).toBe(false);
  });

  it("should connect using token", async () => {
    client = new HermesClient({ endpoint: mockEndpoint, token: "test-token" });
    
    // We need to simulate the socket firing "connect"
    const mockSocket = io("mock");
    (mockSocket.once as any).mockImplementation((event: string, cb: Function) => {
      if (event === "connect") setTimeout(cb, 10);
    });

    const connectPromise = client.connect();
    await connectPromise;

    expect(io).toHaveBeenCalledWith(`${mockEndpoint}/hermes`, expect.objectContaining({
      auth: { token: "test-token" }
    }));
    expect(client.status).toBe("connected");
  });

  it("should connect using apiKey config", async () => {
    client = new HermesClient({
      endpoint: mockEndpoint,
      apiKey: "test-api-key",
      secret: "test-secret",
      userId: "user-1",
      displayName: "Test User"
    });

    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        token: "api-token",
        user: { hermesUserId: "user-1", displayName: "Test User" }
      })
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);

    const mockSocket = io("mock");
    (mockSocket.once as any).mockImplementation((event: string, cb: Function) => {
      if (event === "connect") setTimeout(cb, 10);
    });

    await client.connect();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(client.user?.userId).toBe("user-1");
    expect(io).toHaveBeenCalledWith(`${mockEndpoint}/hermes`, expect.objectContaining({
      auth: { token: "api-token" }
    }));
  });

  it("should fail connection if fetch fails", async () => {
    client = new HermesClient({
      endpoint: mockEndpoint,
      apiKey: "test-key", secret: "test-secret", userId: "u1"
    });
    
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ success: false, message: "Invalid credentials" })
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);

    await expect(client.connect()).rejects.toThrow("Invalid credentials");
    expect(client.status).toBe("error");
  });

  it("should disconnect correctly", async () => {
    client = new HermesClient({ endpoint: mockEndpoint, token: "test-token" });
    
    const mockSocket = io("mock");
    (mockSocket.once as any).mockImplementation((event: string, cb: Function) => {
      if (event === "connect") setTimeout(cb, 10);
    });

    await client.connect();
    
    // Verify disconnect logic
    expect(client.status).toBe("connected");
    
    const disconnectSpy = vi.fn();
    client.on("disconnected", disconnectSpy);
    
    client.disconnect();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(client.status).toBe("disconnected");
    expect(client.isConnected).toBe(false);
    expect(disconnectSpy).toHaveBeenCalledWith("manual");
  });
  
  it("should wire events from socket to the local emitter", async () => {
    client = new HermesClient({ endpoint: mockEndpoint, token: "test-token" });
    
    const mockSocket = io("mock");
    let messageReceiveCb: Function | undefined;

    (mockSocket.on as any).mockImplementation((event: string, cb: Function) => {
      if (event === "message:receive") messageReceiveCb = cb;
    });

    (mockSocket.once as any).mockImplementation((event: string, cb: Function) => {
      if (event === "connect") setTimeout(cb, 10);
    });

    await client.connect();

    const spy = vi.fn();
    client.on("message:receive", spy);

    // Simulate socket event
    expect(messageReceiveCb).toBeDefined();
    if (messageReceiveCb) {
      messageReceiveCb({ id: "msg-1", text: "hello" });
    }

    expect(spy).toHaveBeenCalledWith({ id: "msg-1", text: "hello" });
  });
});
