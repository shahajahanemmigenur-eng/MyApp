
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Phone, Mic, MicOff, Video, UserPlus, Speaker, VideoOff, VolumeX, UserPlus2, UserCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoCallScreen } from './video-call-screen';

export function DialerScreen({ user, onEndCall }: { user: User; onEndCall: () => void }) {
  const [callStatus, setCallStatus] = useState('Calling...');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus('Connected');
    }, 2500);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'Connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleVideoClick = () => {
    setIsVideoOn(true);
    setShowVideoCall(true);
  };
  
  const handleEndVideoCall = () => {
    setShowVideoCall(false);
    setIsVideoOn(false);
  };

  if (showVideoCall) {
    return <VideoCallScreen user={user} onEndCall={handleEndVideoCall} />;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Avatar className="w-32 h-32 border-4 border-white/50 mb-4">
          <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
          <AvatarFallback className="text-5xl bg-muted text-muted-foreground">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold">{user.name}</h1>
        <p className="text-lg text-white/80 mt-2">
          {callStatus === 'Connected' ? formatDuration(callDuration) : callStatus}
        </p>
      </div>

      <div className="p-8">
        <div className="flex justify-around items-center mb-12">
            <Button variant="ghost" size="icon" className={cn("h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 flex flex-col gap-1", isMuted && "bg-white/40")} onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                <span className='text-xs'>Mute</span>
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 flex flex-col gap-1", isSpeakerOn && "bg-white/40")} onClick={() => setIsSpeakerOn(!isSpeakerOn)}>
                {isSpeakerOn ? <VolumeX className="h-6 w-6" /> : <Speaker className="h-6 w-6" />}
                <span className='text-xs'>Speaker</span>
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 flex flex-col gap-1", isVideoOn && "bg-white/40")} onClick={handleVideoClick}>
                {isVideoOn ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                <span className='text-xs'>Video</span>
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 flex flex-col gap-1", isAddingUser && "bg-white/40")} onClick={() => setIsAddingUser(!isAddingUser)}>
                {isAddingUser ? <UserCheck2 className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                <span className='text-xs'>Add</span>
            </Button>
        </div>

        <div className="flex justify-center">
            <Button
            variant="destructive"
            size="icon"
            className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600"
            onClick={onEndCall}
            >
            <Phone className="h-10 w-10 rotate-[135deg]" />
            </Button>
        </div>
      </div>
    </div>
  );
}
