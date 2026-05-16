import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redis = null;

// In-memory cache fallback
const memoryCache = new Map();

const cacheAdapter = {
  async get(key) {
    if (redis) return await redis.get(key);
    return memoryCache.get(key);
  },
  async set(key, value, options) {
    if (redis) return await redis.set(key, value, options);
    memoryCache.set(key, value);
    if (options?.EX) {
      setTimeout(() => memoryCache.delete(key), options.EX * 1000);
    }
  },
  async del(key) {
    if (redis) return await redis.del(key);
    memoryCache.delete(key);
  }
};

// Try to connect to Redis, fallback to memory cache
try {
  if (process.env.REDIS_URL) {
    redis = createClient({ url: process.env.REDIS_URL });
    
    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
    
    redis.on('error', (err) => {
      console.warn('⚠️  Redis error, using memory cache:', err.message);
      redis = null;
    });
    
    await redis.connect();
  } else {
    console.log('ℹ️  Redis not configured, using in-memory cache');
  }
} catch (error) {
  console.log('ℹ️  Redis unavailable, using in-memory cache');
  redis = null;
}

export default cacheAdapter;
