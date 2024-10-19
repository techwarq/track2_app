import { createClient } from 'redis'

const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createClient> | undefined
  isRedisConnected: boolean
}

if (!globalForRedis.redis) {
  globalForRedis.redis = createClient({ url: process.env.REDIS_URL })
  globalForRedis.isRedisConnected = false
}

export const redis = globalForRedis.redis

export async function connectToRedis() {
  if (!globalForRedis.isRedisConnected) {
    await redis.connect()
    globalForRedis.isRedisConnected = true
  }
}