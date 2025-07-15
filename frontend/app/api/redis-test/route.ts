import { createClient } from 'redis';
import { NextRequest, NextResponse } from 'next/server';

// Redis client configuration
const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    // Add additional configuration if needed
    socket: {
      connectTimeout: 5000,
      lazyConnect: true,
    },
  });

  // Handle connection errors
  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    console.log('Redis Client Connected');
  });

  client.on('ready', () => {
    console.log('Redis Client Ready');
  });

  client.on('end', () => {
    console.log('Redis Client Disconnected');
  });

  await client.connect();
  return client;
};

// GET endpoint - Retrieve data from Redis
export async function GET(request: NextRequest) {
  let redis;
  
  try {
    redis = await getRedisClient();
    
    // Get the key from query parameters, default to "item"
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') || 'item';
    
    // Fetch data from Redis
    const result = await redis.get(key);
    
    return NextResponse.json({ 
      success: true,
      key,
      result,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('Redis GET Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    // Always close the connection
    if (redis) {
      try {
        await redis.quit();
      } catch (closeError) {
        console.error('Error closing Redis connection:', closeError);
      }
    }
  }
}

// POST endpoint - Set data in Redis
export async function POST(request: NextRequest) {
  let redis;
  
  try {
    redis = await getRedisClient();
    
    // Parse the request body
    const body = await request.json();
    const { key = 'item', value, ttl } = body;
    
    if (value === undefined) {
      return NextResponse.json({ 
        success: false,
        error: 'Value is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Set data in Redis with optional TTL (time to live)
    let result;
    if (ttl && typeof ttl === 'number' && ttl > 0) {
      result = await redis.setEx(key, ttl, JSON.stringify(value));
    } else {
      result = await redis.set(key, JSON.stringify(value));
    }
    
    return NextResponse.json({ 
      success: true,
      key,
      value,
      result,
      ttl: ttl || null,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('Redis POST Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    // Always close the connection
    if (redis) {
      try {
        await redis.quit();
      } catch (closeError) {
        console.error('Error closing Redis connection:', closeError);
      }
    }
  }
}

// DELETE endpoint - Remove data from Redis
export async function DELETE(request: NextRequest) {
  let redis;
  
  try {
    redis = await getRedisClient();
    
    // Get the key from query parameters
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ 
        success: false,
        error: 'Key parameter is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Delete data from Redis
    const result = await redis.del(key);
    
    return NextResponse.json({ 
      success: true,
      key,
      deleted: result > 0,
      result,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('Redis DELETE Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    // Always close the connection
    if (redis) {
      try {
        await redis.quit();
      } catch (closeError) {
        console.error('Error closing Redis connection:', closeError);
      }
    }
  }
}
