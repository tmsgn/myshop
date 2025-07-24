// Simple in-memory cache for server-side data fetching
// Usage: const data = await cacheFetch(key, () => fetchFn())
const cache = new Map();

export async function cacheFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = 60
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.time < ttl * 1000) {
    return cached.value;
  }
  const value = await fetchFn();
  cache.set(key, { value, time: now });
  return value;
}
