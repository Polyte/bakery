import Redis from "ioredis"

const MEMORY_MAX = 500
const memory = new Map<string, { expiresAt: number; value: string }>()

type GlobalRedis = typeof globalThis & { __daddaRedis?: Redis | null }

function getRedis(): Redis | null {
  const g = globalThis as GlobalRedis
  if (g.__daddaRedis !== undefined) return g.__daddaRedis

  const url = process.env.REDIS_URL?.trim()
  if (!url) {
    g.__daddaRedis = null
    return null
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 1500,
    retryStrategy: (times) => (times > 2 ? null : 200),
  })
  client.on("error", () => {
    // Stay up without Redis: callers fall back to the in-memory map.
  })
  g.__daddaRedis = client
  return client
}

function memoryGet(key: string): string | null {
  const hit = memory.get(key)
  if (!hit) return null
  if (hit.expiresAt <= Date.now()) {
    memory.delete(key)
    return null
  }
  memory.delete(key)
  memory.set(key, hit)
  return hit.value
}

function memorySet(key: string, value: string, ttlSeconds: number) {
  if (memory.size >= MEMORY_MAX) {
    const oldest = memory.keys().next().value
    if (oldest) memory.delete(oldest)
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (redis) {
    try {
      const raw = await redis.get(key)
      if (raw) return JSON.parse(raw) as T
    } catch {
      // Redis down or invalid JSON — try memory, then miss.
    }
  }

  const local = memoryGet(key)
  if (!local) return null
  try {
    return JSON.parse(local) as T
  } catch {
    memory.delete(key)
    return null
  }
}

export async function cacheSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const raw = JSON.stringify(value)
  memorySet(key, raw, ttlSeconds)

  const redis = getRedis()
  if (!redis) return
  try {
    await redis.set(key, raw, "EX", ttlSeconds)
  } catch {
    // Memory already holds the entry.
  }
}

const RATE_MEMORY_MAX = 4000
const rateMemory = new Map<string, { count: number; resetAt: number }>()

function memoryRateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now()
  const hit = rateMemory.get(key)
  if (!hit || hit.resetAt <= now) {
    if (rateMemory.size >= RATE_MEMORY_MAX) {
      const oldest = rateMemory.keys().next().value
      if (oldest) rateMemory.delete(oldest)
    }
    rateMemory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return true
  }
  hit.count += 1
  return hit.count <= limit
}

/** Returns true when the request is allowed. */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const redis = getRedis()
  if (redis) {
    try {
      const n = await redis.incr(key)
      if (n === 1) await redis.expire(key, windowSeconds)
      return n <= limit
    } catch {
      // Fall through to memory.
    }
  }
  return memoryRateLimit(key, limit, windowSeconds)
}
