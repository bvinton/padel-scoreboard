import { NextResponse } from 'next/server';

// We use a global variable to store the latest action
// In a real app we'd use a database, but for a live scoreboard, this is faster!
let lastAction = { id: 0, type: '' };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action) {
    lastAction = { id: Date.now(), type: action };
    return NextResponse.json({ success: true, action });
  }

  // If no action is provided, we just return the latest one
  return NextResponse.json(lastAction);
}