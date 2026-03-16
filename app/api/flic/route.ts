import { NextResponse } from 'next/server';

// This acts as our temporary in-memory database for all active rooms!
// Example: { "A7B9": { id: 17098234, type: "team1" } }
const roomStates: Record<string, { id: number, type: string }> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');
  const type = searchParams.get('type');

  // If they don't provide a room code, reject the request
  if (!room) {
    return NextResponse.json({ error: "Room code required" }, { status: 400 });
  }

  const roomUpper = room.toUpperCase();

  // SCENARIO 1: A Flic Button was pressed (Writing the score)
  if (type) {
    roomStates[roomUpper] = {
      id: Date.now(),
      type: type
    };
    return NextResponse.json({ success: true, room: roomUpper, action: type });
  }

  // SCENARIO 2: The Tablet is asking for the score (Reading the score)
  const currentState = roomStates[roomUpper] || { id: 0, type: 'none' };
  return NextResponse.json(currentState);
}