// Lightweight localStorage cache used for "stale-while-revalidate" rendering:
// pages hydrate their state synchronously from the cache so a reload shows the
// previously loaded content instantly, then overwrite it once the network
// request resolves. Safe to use where the cached value is fully replaced by the
// authoritative server response on every fetch.

const PREFIX = "swr-cache:";

export const readCache = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const writeCache = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled (private mode); caching is best-effort.
  }
};
