import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Force Vercel to NEVER cache this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// The exact "Mega-Names" from your Vercel Dashboard!
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || '',
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || '',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');
  const type = searchParams.get('type');

  if (!room) {
    return NextResponse.json({ error: "Room code required" }, { status: 400 });
  }

  const roomUpper = room.toUpperCase();

  try {
    // SCENARIO 1: A Flic Button was pressed (Write to the Database)
    if (type) {
      const newState = {
        id: Date.now(),
        type: type
      };
      
      // Save to Redis (Expires in 24 hours to keep the database clean)
      await redis.set(`room:${roomUpper}`, newState, { ex: 86400 });
      
      return NextResponse.json(
        { success: true, room: roomUpper, action: type },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' } }
      );
    }

    // SCENARIO 2: The Tablet is asking for the score (Read from the Database)
    const currentState = await redis.get<{id: number, type: string}>(`room:${roomUpper}`);
    
    return NextResponse.json(
      currentState || { id: 0, type: 'none' }, 
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' } }
    );
    
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Database connection failed. Check Environment Variables." }, { status: 500 });
  }
}