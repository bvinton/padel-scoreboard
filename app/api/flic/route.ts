import { NextResponse } from 'next/server';

// --- FORCE VERCEL TO STOP CACHING ---
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Temporary in-memory database
const roomStates: Record<string, { id: number, type: string }> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');
  const type = searchParams.get('type');

  if (!room) {
    return NextResponse.json({ error: "Room code required" }, { status: 400 });
  }

  const roomUpper = room.toUpperCase();

  // SCENARIO 1: A Flic Button was pressed
  if (type) {
    roomStates[roomUpper] = {
      id: Date.now(),
      type: type
    };
    
    return NextResponse.json(
      { success: true, room: roomUpper, action: type },
      { 
        // Strict headers telling the browser and Vercel NOT to cache this
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' } 
      }
    );
  }

  // SCENARIO 2: The Tablet is asking for the score
  const currentState = roomStates[roomUpper] || { id: 0, type: 'none' };
  
  return NextResponse.json(
    currentState,
    { 
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' } 
    }
  );
}