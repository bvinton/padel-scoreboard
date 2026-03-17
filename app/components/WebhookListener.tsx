import { useEffect, useRef, useState } from "react";
import PusherClient from 'pusher-js';

interface WebhookListenerProps {
  roomCode: string;
  handleScore: (team: 'team1' | 'team2') => void;
  handleUndo: () => void;
  setTestSignals: React.Dispatch<React.SetStateAction<{ team1: boolean; team2: boolean; undo: boolean }>>;
  setIsOnline: (status: boolean) => void;
}

export default function WebhookListener({ roomCode, handleScore, handleUndo, setTestSignals, setIsOnline }: WebhookListenerProps) {
  const [lastProcessedId, setLastProcessedId] = useState(0);
  const lastIdRef = useRef(lastProcessedId);
  const handlersRef = useRef({ handleScore, handleUndo });

  useEffect(() => { handlersRef.current = { handleScore, handleUndo }; });

  useEffect(() => {
    if (!roomCode) return; 
    
    // Check for the last button press so we don't double-score on reload
    fetch(`/api/flic?room=${roomCode}`).then(res => res.json()).then(data => {
         if (data.id) { lastIdRef.current = data.id; setLastProcessedId(data.id); }
    }).catch(() => {});

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '';
    if (!pusherKey) return; 

    // Connect to Pusher
    const pusher = new PusherClient(pusherKey, { cluster: pusherCluster });
    pusher.connection.bind('state_change', function(states: { current: string }) { 
      setIsOnline(states.current === 'connected'); 
    });
    
    const channel = pusher.subscribe(`room-${roomCode}`);

    channel.bind('button-pressed', (data: { id: number, type: string }) => {
      if (data.id > lastIdRef.current) {
        lastIdRef.current = data.id;
        setLastProcessedId(data.id);
        
        if (data.type === 'team1') setTestSignals(prev => ({ ...prev, team1: true }));
        if (data.type === 'team2') setTestSignals(prev => ({ ...prev, team2: true }));
        if (data.type === 'undo') setTestSignals(prev => ({ ...prev, undo: true }));

        if (data.type === 'team1') handlersRef.current.handleScore('team1');
        if (data.type === 'team2') handlersRef.current.handleScore('team2');
        if (data.type === 'undo') handlersRef.current.handleUndo();
      }
    });

    return () => { channel.unbind_all(); channel.unsubscribe(); pusher.disconnect(); };
  }, [roomCode, setTestSignals, setIsOnline]);

  return null; // Invisible background component
}