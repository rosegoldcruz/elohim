# Redis Integration for AEON Platform

This document describes the Redis integration added to the AEON platform for caching, session management, and real-time data storage.

## 🚀 Features

- **GET**: Retrieve values from Redis by key
- **SET**: Store values in Redis with optional TTL (Time To Live)
- **DELETE**: Remove keys from Redis
- **Connection Management**: Automatic connection handling with error recovery
- **Type Safety**: Full TypeScript support
- **Environment Configuration**: Configurable Redis URL

## 📁 Files Added

### API Route
- `app/api/redis-test/route.ts` - Main Redis API endpoint

### Test Interface
- `app/test/redis/page.tsx` - Interactive test interface for Redis operations

### Configuration
- Updated `env.mjs` to include `REDIS_URL` environment variable

## 🔧 Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud/remote instance:
# REDIS_URL=redis://username:password@host:port
```

### 2. Local Redis Setup

#### Using Docker:
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

#### Using Redis Cloud:
1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Copy the connection string to `REDIS_URL`

## 📡 API Endpoints

### GET `/api/redis-test`

Retrieve a value from Redis.

**Query Parameters:**
- `key` (optional): The key to retrieve (defaults to "item")

**Example:**
```bash
curl "http://localhost:3000/api/redis-test?key=mykey"
```

**Response:**
```json
{
  "success": true,
  "key": "mykey",
  "result": "stored_value",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST `/api/redis-test`

Store a value in Redis.

**Body:**
```json
{
  "key": "mykey",
  "value": "myvalue",
  "ttl": 3600
}
```

**Parameters:**
- `key` (optional): The key to store (defaults to "item")
- `value` (required): The value to store
- `ttl` (optional): Time to live in seconds

**Example:**
```bash
curl -X POST "http://localhost:3000/api/redis-test" \
  -H "Content-Type: application/json" \
  -d '{"key":"mykey","value":"Hello Redis!","ttl":3600}'
```

**Response:**
```json
{
  "success": true,
  "key": "mykey",
  "value": "Hello Redis!",
  "result": "OK",
  "ttl": 3600,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### DELETE `/api/redis-test`

Remove a key from Redis.

**Query Parameters:**
- `key` (required): The key to delete

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/redis-test?key=mykey"
```

**Response:**
```json
{
  "success": true,
  "key": "mykey",
  "deleted": true,
  "result": 1,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🧪 Testing

### Interactive Test Interface

Visit `http://localhost:3000/test/redis` to access the interactive test interface where you can:

- Test GET operations
- Test SET operations with optional TTL
- Test DELETE operations
- View real-time responses

### Manual Testing

1. **Set a value:**
```bash
curl -X POST "http://localhost:3000/api/redis-test" \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":"Hello World!"}'
```

2. **Get the value:**
```bash
curl "http://localhost:3000/api/redis-test?key=test"
```

3. **Delete the value:**
```bash
curl -X DELETE "http://localhost:3000/api/redis-test?key=test"
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit Redis credentials to version control
2. **Connection Limits**: Redis connections are properly closed after each operation
3. **Error Handling**: Comprehensive error handling prevents information leakage
4. **Input Validation**: All inputs are validated before processing

## 🚀 Production Deployment

### Vercel Deployment

1. Add `REDIS_URL` to your Vercel environment variables
2. Use a managed Redis service like:
   - [Upstash Redis](https://upstash.com/)
   - [Redis Cloud](https://redis.com/try-free/)
   - [AWS ElastiCache](https://aws.amazon.com/elasticache/)

### Docker Deployment

If deploying with Docker, ensure Redis is accessible from your container network.

## 📊 Use Cases for AEON Platform

1. **Video Generation Queue**: Store video generation jobs and status
2. **User Sessions**: Cache user preferences and temporary data
3. **Rate Limiting**: Track API usage per user
4. **Real-time Updates**: Store progress updates for long-running operations
5. **Caching**: Cache expensive API responses (OpenAI, Replicate, etc.)

## 🔧 Advanced Configuration

### Connection Pooling

For production use, consider implementing connection pooling:

```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
    lazyConnect: true,
    keepAlive: 30000,
  },
  // Add connection pooling options
});
```

### Clustering

For high availability, configure Redis clustering:

```typescript
import { createCluster } from 'redis';

const cluster = createCluster({
  rootNodes: [
    { url: 'redis://node1:6379' },
    { url: 'redis://node2:6379' },
    { url: 'redis://node3:6379' },
  ],
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure Redis is running and accessible
2. **Authentication Failed**: Check Redis credentials in `REDIS_URL`
3. **Timeout Errors**: Increase connection timeout in client configuration
4. **Memory Issues**: Monitor Redis memory usage and configure appropriate limits

### Debug Mode

Enable Redis debug logging:

```typescript
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});
```

## 📚 Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Node Redis Client](https://github.com/redis/node-redis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Redis Security](https://redis.io/docs/manual/security/)
