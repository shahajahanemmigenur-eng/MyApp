
'use client';

import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Phone, PhoneOff } from 'lucide-react';

export function IncomingAudioCall({ user, onAccept, onReject }: { user: User; onAccept: () => void; onReject: () => void }) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Avatar className="w-32 h-32 border-4 border-white/50 mb-4 animate-pulse">
          <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
          <AvatarFallback className="text-5xl bg-muted text-muted-foreground">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold">{user.name}</h1>
        <p className="text-lg text-white/80 mt-2">Incoming Audio Call...</p>
      </div>

      <div className="p-8 flex justify-around items-center">
        <div className="flex flex-col items-center gap-2">
            <Button
                variant="destructive"
                size="icon"
                className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600"
                onClick={onReject}
            >
                <PhoneOff className="h-10 w-10" />
            </Button>
            <span className="text-sm">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Button
                size="icon"
                className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-600"
                onClick={onAccept}
            >
                <Phone className="h-10 w-10" />
            </Button>
            <span className="text-sm">Accept</span>
        </div>
      </div>
    </div>
  );
}
