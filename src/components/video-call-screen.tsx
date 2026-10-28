
'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Phone, Mic, MicOff, VideoOff, Camera, CameraOff, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

export function VideoCallScreen({ user, onEndCall }: { user: User; onEndCall: () => void }) {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  
  const toggleMute = () => {
      setIsMuted(!isMuted);
      if(streamRef.current) {
          streamRef.current.getAudioTracks().forEach(track => {
              track.enabled = isMuted;
          });
      }
  };
  
  const toggleCamera = () => {
      setIsCameraOn(!isCameraOn);
       if(streamRef.current) {
          streamRef.current.getVideoTracks().forEach(track => {
              track.enabled = !isCameraOn;
          });
      }
  };


  return (
    <div className="flex flex-col h-full bg-black text-white">
        <div className="relative flex-1 flex items-center justify-center">
            {/* Remote user video (placeholder) */}
            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center">
                <Avatar className="w-32 h-32 border-4 border-white/50 mb-4">
                    <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
                    <AvatarFallback className="text-5xl bg-muted text-muted-foreground">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-white/70">Connecting...</p>
            </div>
            
            {/* Local user video */}
            <div className="absolute top-4 right-4 w-28 h-40 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/30">
                {hasCameraPermission ? (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <CameraOff className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">No Camera</p>
                    </div>
                )}
            </div>

             <div className="absolute bottom-4 left-0 right-0 px-8">
                <div className="flex justify-center items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" className={cn("h-14 w-14 rounded-full bg-white/20 hover:bg-white/30", isMuted && "bg-white/40")} onClick={toggleMute}>
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30" onClick={toggleCamera}>
                        {isCameraOn ? <VideoOff className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                    </Button>
                     <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30">
                        <RefreshCcw className="h-6 w-6" />
                    </Button>
                </div>
                 <div className="flex justify-center">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                        onClick={onEndCall}
                    >
                        <Phone className="h-8 w-8 rotate-[135deg]" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
