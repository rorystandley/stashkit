export interface StorageLike {
  length: number;
  clear(): void;
  getItem(key: string): string | null;
  key?(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const TEST_KEY = "__lsp_probe__";

const createMemoryStorage = () => new MemoryStorage();

type GlobalWithStorage = typeof globalThis & {
  localStorage?: StorageLike;
};

const getGlobalStorage = (): StorageLike | null => {
  if (typeof globalThis === "undefined") {
    return null;
  }

  const candidate = globalThis as GlobalWithStorage;
  return candidate.localStorage ?? null;
};

const detectStorage = (custom?: StorageLike): StorageLike => {
  if (custom) {
    return custom;
  }

  const globalStorage = getGlobalStorage();
  if (globalStorage) {
    return globalStorage;
  }

  return createMemoryStorage();
};

const isStorageUsable = (storage: StorageLike): boolean => {
  try {
    storage.setItem(TEST_KEY, "1");
    storage.removeItem(TEST_KEY);
    return true;
  } catch {
    return false;
  }
};

export class StorageUnavailableError extends Error {
  constructor(message = "localStorage is unavailable; falling back to in-memory storage") {
    super(message);
    this.name = "StorageUnavailableError";
  }
}

export type CreateStoreOptions = {
  namespace?: string;
  defaultTTL?: number; // seconds
  storage?: StorageLike;
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
};

export type SetOptions = {
  ttl?: number; // seconds
};

export type Store = {
  get<T = unknown>(key: string): T | null;
  set<T = unknown>(key: string, value: T, options?: SetOptions): void;
  remove(key: string): void;
  clear(): void;
};

type StoredPayload<T = unknown> = {
  value: T;
  expiresAt?: number;
};

const getNow = () => Date.now();

const normalizeNamespace = (namespace?: string): string => {
  if (!namespace) {
    return "lsp";
  }
  return namespace.replace(/:+$/, "");
};

const makeKey = (namespace: string, key: string): string => `${namespace}:${key}`;

const encode = (value: unknown, ttlSeconds?: number, serialize = JSON.stringify): string => {
  const payload: StoredPayload = { value };

  if (ttlSeconds && ttlSeconds > 0) {
    payload.expiresAt = getNow() + ttlSeconds * 1000;
  }

  return serialize(payload);
};

const decode = <T = unknown>(raw: string | null, deserialize = JSON.parse): StoredPayload<T> | null => {
  if (!raw) {
    return null;
  }

  try {
    return deserialize(raw) as StoredPayload<T>;
  } catch {
    return null;
  }
};

const isExpired = (payload: StoredPayload | null): boolean => {
  if (!payload) {
    return false;
  }

  if (!payload.expiresAt) {
    return false;
  }

  return payload.expiresAt <= getNow();
};

const resolveStorage = (candidate?: StorageLike): { storage: StorageLike; usedMemoryFallback: boolean } => {
  const detected = detectStorage(candidate);

  if (isStorageUsable(detected)) {
    return { storage: detected, usedMemoryFallback: false };
  }

  return { storage: createMemoryStorage(), usedMemoryFallback: true };
};

export const createStore = (options: CreateStoreOptions = {}): Store => {
  const namespace = normalizeNamespace(options.namespace);
  const { storage, usedMemoryFallback } = resolveStorage(options.storage);
  const serializer = options.serialize ?? JSON.stringify;
  const deserializer = options.deserialize ?? JSON.parse;
  const defaultTTL = options.defaultTTL;

  if (usedMemoryFallback && !options.storage) {
    // Surfacing availability issues helps debugging without throwing in runtime code paths.
    console.warn(new StorageUnavailableError().message);
  }

  const getPayload = <T,>(key: string) => decode<T>(storage.getItem(key), deserializer);

  const trackedKeys = new Set<string>();

  const store: Store = {
    get<T = unknown>(key: string): T | null {
      const storageKey = makeKey(namespace, key);
      const payload = getPayload<T>(storageKey);

      if (isExpired(payload)) {
        storage.removeItem(storageKey);
        trackedKeys.delete(storageKey);
        return null;
      }

      if (!payload) {
        trackedKeys.delete(storageKey);
        return null;
      }

      trackedKeys.add(storageKey);
      return payload.value;
    },

    set<T = unknown>(key: string, value: T, setOptions?: SetOptions): void {
      const storageKey = makeKey(namespace, key);
      const ttl = setOptions?.ttl ?? defaultTTL;
      storage.setItem(storageKey, encode(value, ttl, serializer));
      trackedKeys.add(storageKey);
    },

    remove(key: string): void {
      const storageKey = makeKey(namespace, key);
      storage.removeItem(storageKey);
      trackedKeys.delete(storageKey);
    },

    clear(): void {
      const keyAccessor = storage.key?.bind(storage);

      if (!keyAccessor) {
        trackedKeys.forEach((tracked) => storage.removeItem(tracked));
        trackedKeys.clear();
        return;
      }

      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = keyAccessor(i);
        if (key && key.startsWith(`${namespace}:`)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
    },
  };

  return store;
};

export { MemoryStorage };
