
'use client';

import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Video, VideoOff } from 'lucide-react';

export function IncomingVideoCall({ user, onAccept, onReject }: { user: User; onAccept: () => void; onReject: () => void }) {
  return (
    <div className="relative flex flex-col h-full bg-black text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-md scale-105"
        style={{ backgroundImage: `url(${user.avatar.imageUrl})`}} 
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
        <Avatar className="w-32 h-32 border-4 border-white/50 mb-4 animate-pulse">
          <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
          <AvatarFallback className="text-5xl bg-muted text-muted-foreground">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold">{user.name}</h1>
        <p className="text-lg text-white/80 mt-2">Incoming Video Call...</p>
      </div>

      <div className="relative p-8 flex justify-around items-center z-10">
        <div className="flex flex-col items-center gap-2">
            <Button
                variant="destructive"
                size="icon"
                className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600"
                onClick={onReject}
            >
                <VideoOff className="h-10 w-10" />
            </Button>
            <span className="text-sm">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Button
                size="icon"
                className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-600"
                onClick={onAccept}
            >
                <Video className="h-10 w-10" />
            </Button>
            <span className="text-sm">Accept</span>
        </div>
      </div>
    </div>
  );
}
