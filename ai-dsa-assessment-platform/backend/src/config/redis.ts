import Redis from 'ioredis';
import { config } from './config';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(config.redis.url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    });

    redisClient.on('connect', () => console.log('✅ Redis connected'));
    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis error (non-fatal):', err.message);
      redisClient = null;
    });

    return redisClient;
  } catch (err) {
    console.warn('⚠️  Redis unavailable, running without cache');
    return null;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch {
    // graceful degradation
  }
}

export async function redisDel(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // graceful degradation
  }
}
