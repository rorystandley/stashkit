import { describe, expect, it, vi, afterEach } from "vitest";
import { createStore, MemoryStorage, type StorageLike } from "../src";

afterEach(() => {
  vi.useRealTimers();
});

describe("StashKit", () => {
  it("sets and retrieves values using JSON serialization", () => {
    const storage = new MemoryStorage();
    const store = createStore({ namespace: "spec", storage });

    store.set("user", { id: 1, name: "Jess" });
    expect(store.get<{ id: number; name: string }>("user")).toEqual({ id: 1, name: "Jess" });
  });

  it("respects per-key TTL", () => {
    vi.useFakeTimers();
    const store = createStore({ namespace: "ttl", storage: new MemoryStorage() });

    store.set("temp", "value", { ttl: 10 });

    vi.advanceTimersByTime(9000);
    expect(store.get("temp")).toBe("value");

    vi.advanceTimersByTime(2000);
    expect(store.get("temp")).toBeNull();
  });

  it("applies default TTL when no per-key TTL provided", () => {
    vi.useFakeTimers();
    const store = createStore({ namespace: "default", storage: new MemoryStorage(), defaultTTL: 5 });

    store.set("session", "abc");

    vi.advanceTimersByTime(4000);
    expect(store.get("session")).toBe("abc");

    vi.advanceTimersByTime(2000);
    expect(store.get("session")).toBeNull();
  });

  it("isolates data per namespace and clears namespaced keys only", () => {
    const sharedStorage = new MemoryStorage();
    const appStore = createStore({ namespace: "app", storage: sharedStorage });
    const adminStore = createStore({ namespace: "admin", storage: sharedStorage });

    appStore.set("token", "user-token");
    adminStore.set("token", "admin-token");

    appStore.clear();

    expect(appStore.get("token")).toBeNull();
    expect(adminStore.get("token")).toBe("admin-token");
  });

  it("falls back to memory storage when provided storage is unavailable", () => {
    class BrokenStorage implements StorageLike {
      length = 0;
      clear(): void {
        throw new Error("broken");
      }
      getItem(): string | null {
        throw new Error("broken");
      }
      key(): string | null {
        throw new Error("broken");
      }
      removeItem(): void {
        throw new Error("broken");
      }
      setItem(): void {
        throw new Error("broken");
      }
    }

    const store = createStore({ namespace: "fallback", storage: new BrokenStorage() });

    expect(() => store.set("k", "v")).not.toThrow();
    expect(store.get("k")).toBe("v");
  });
});
