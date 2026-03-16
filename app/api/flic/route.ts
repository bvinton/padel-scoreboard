import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Force Vercel to NEVER cache this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Automatically connects using the UPSTASH_REDIS_REST variables you just created!
const redis = Redis.fromEnv();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');
  const type = searchParams.get('type');

  if (!room) {
    return NextResponse.json({ error: "Room code required" }, { status: 400 });
  }

  const roomUpper = room.toUpperCase();

  // SCENARIO 1: A Flic Button was pressed (Write to the Database)
  if (type) {
    const newState = {
      id: Date.now(),
      type: type
    };
    
    // Save to Redis. We set it to expire in 24 hours (86400 seconds) 
    // to automatically clean up old games and save your free storage space!
    await redis.set(`room:${roomUpper}`, newState, { ex: 86400 });
    
    return NextResponse.json(
      { success: true, room: roomUpper, action: type },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' } }
    );
  }

  // SCENARIO 2: The Tablet is asking for the score (Read from the Database)
  const currentState = await redis.get<{id: number, type: string}>(`room:${roomUpper}`);
  
  return NextResponse.json(
    currentState || { id: 0, type: 'none' }, // If no score yet, return empty
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' } }
  );
}