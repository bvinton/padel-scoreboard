import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import Pusher from 'pusher';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Connect to your Database
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || '',
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || '',
});

// Connect to your new WebSockets Post Office
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');
  const type = searchParams.get('type');

  if (!room) return NextResponse.json({ error: "Room code required" }, { status: 400 });
  const roomUpper = room.toUpperCase();

  try {
    // SCENARIO 1: Button Pressed (Write to DB & Trigger WebSocket)
    if (type) {
      const newState = { id: Date.now(), type: type };
      
      // 1. Save to Database
      await redis.set(`room:${roomUpper}`, newState, { ex: 86400 });
      
      // 2. Instantly push the update to any tablet listening to this specific room!
      await pusher.trigger(`room-${roomUpper}`, 'button-pressed', newState);
      
      return NextResponse.json({ success: true, room: roomUpper, action: type }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // SCENARIO 2: Initial App Load (Read from DB once)
    const currentState = await redis.get<{id: number, type: string}>(`room:${roomUpper}`);
    return NextResponse.json(currentState || { id: 0, type: 'none' }, { headers: { 'Cache-Control': 'no-store' } });
    
  } catch (error) {
    console.error("Database/Pusher Error:", error);
    return NextResponse.json({ error: "Connection failed." }, { status: 500 });
  }
}