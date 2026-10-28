'use client';

import { useState, useRef, useEffect, useCallback, TouchEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, FileUp, RefreshCcw, Send, X, GalleryHorizontal, Search, PlusCircle, Users, Check, Save, Zap, Timer, Wind, ChevronDown, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { users, currentUser } from '@/lib/data';
import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useSwipeable } from 'react-swipeable';


const MAX_VIDEO_DURATION = 15000; // 15 seconds

const filters = [
    { name: 'None', style: {} },
    { name: 'Clarendon', style: { filter: 'contrast(1.2) saturate(1.35)' } },
    { name: 'Gingham', style: { filter: 'sepia(0.1) contrast(0.9)' } },
    { name: 'Moon', style: { filter: 'grayscale(1) contrast(1.1) brightness(1.1)' } },
    { name: 'Lark', style: { filter: 'contrast(.9)' } },
    { name: 'Reyes', style: { filter: 'sepia(.22) brightness(1.1) contrast(.85) saturate(.75)' } },
    { name: 'Juno', style: { filter: 'contrast(1.2) brightness(1.1) saturate(1.2)' } },
    { name: 'Ludwig', style: { filter: 'brightness(1.05) contrast(1.05) saturate(1.4)' } },
    { name: 'Perpetua', style: { filter: 'contrast(1.1) brightness(1.1) saturate(1.1) sepia(0.2)' } },
    { name: 'Amaro', style: { filter: 'contrast(0.9) brightness(1.1) saturate(1.5)' } },
    { name: 'Mayfair', style: { filter: 'contrast(1.1) saturate(1.1)' } },
    { name: 'Rise', style: { filter: 'sepia(0.25) contrast(0.9) brightness(1.1)' } },
    { name: 'Hudson', style: { filter: 'brightness(1.2) contrast(0.9) saturate(1.1)' } },
    { name: 'Valencia', style: { filter: 'sepia(0.15) contrast(1.05) brightness(1.05)' } },
    { name: 'X-Pro II', style: { filter: 'sepia(0.3) contrast(1.5) brightness(0.8)' } },
    { name: 'Sierra', style: { filter: 'sepia(0.25) contrast(1.5) brightness(0.8)' } },
    { name: 'Willow', style: { filter: 'grayscale(0.5) contrast(0.95) brightness(0.9)' } },
    { name: 'Lo-Fi', style: { filter: 'saturate(1.1) contrast(1.5)' } },
    { name: 'Inkwell', style: { filter: 'grayscale(1) brightness(1.2) contrast(0.8)' } },
    { name: 'Hefe', style: { filter: 'contrast(1.1) saturate(1.4) sepia(0.1)' } },
    { name: 'Nashville', style: { filter: 'sepia(0.2) contrast(1.2) brightness(1.05) saturate(1.2)' } },
    { name: 'Sutro', style: { filter: 'brightness(0.8) contrast(1.2) saturate(1.1) sepia(0.3)' } },
    { name: 'Toaster', style: { filter: 'contrast(1.5) brightness(0.9) sepia(0.2)' } },
    { name: 'Brannan', style: { filter: 'sepia(0.5) contrast(1.4)' } },
    { name: '1977', style: { filter: 'contrast(1.1) brightness(1.1) saturate(1.3) sepia(0.1)' } },
    { name: 'Kelvin', style: { filter: 'sepia(0.4) saturate(1.5) brightness(1.1) contrast(1.0)' } },
    { name: 'Walden', style: { filter: 'brightness(1.1) hue-rotate(-10deg) sepia(0.3) saturate(1.6)' } },
    { name: 'Stinson', style: { filter: 'contrast(0.75) saturate(0.85) brightness(1.15)' } },
    { name: 'Vesper', style: { filter: 'contrast(0.9) brightness(1.05) sepia(0.2) saturate(1.2)' } },
    { name: 'Maven', style: { filter: 'sepia(0.25) brightness(0.95) contrast(0.95) saturate(1.5)' } },
    { name: 'Ginza', style: { filter: 'sepia(0.05) brightness(1.15) saturate(1.35) contrast(0.9)' } },
    { name: 'Skyline', style: { filter: 'saturate(1.25) contrast(1.15) brightness(1.05)' } },
    { name: 'Dogpatch', style: { filter: 'contrast(1.5) sepia(0.1) brightness(0.9)' } },
    { name: 'Brooklyn', style: { filter: 'contrast(0.9) brightness(1.1) sepia(0.3)' } },
    { name: 'Helena', style: { filter: 'contrast(1.05) saturate(1.35) sepia(0.15)' } },
    { name: 'Ashby', style: { filter: 'sepia(0.4) contrast(1.2) saturate(1.8)' } },
    { name: 'Charmes', style: { filter: 'sepia(0.2) contrast(1.25) saturate(1.25) brightness(1.05)' } },
];


export default function CameraPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startY = useRef<number | null>(null);
  const zoomCapabilities = useRef<{min: number, max: number, step: number} | null>(null);
  const flashCapabilities = useRef<{torch: boolean} | null>(null);
  const currentZoom = useRef(1);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  
  const [isSendToSheetOpen, setIsSendToSheetOpen] = useState(false);
  const [sendToSearchTerm, setSendToSearchTerm] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());


  const isPreviewing = !!capturedImage || !!capturedVideo;
  
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const getCameraPermission = useCallback(async (deviceId?: string) => {
    stopStream();
    try {
      const videoConstraints: MediaTrackConstraints = { zoom: true };
      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        // Prefer rear camera by default
        videoConstraints.facingMode = 'environment';
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true
      });
      
      streamRef.current = stream;
      setHasCameraPermission(true);

      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      if (capabilities.zoom) {
          zoomCapabilities.current = capabilities.zoom;
      }
      if (capabilities.torch) {
          flashCapabilities.current = { torch: true };
      } else {
          flashCapabilities.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      const currentDeviceId = videoTrack.getSettings().deviceId;
      const currentDeviceIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
      if (currentDeviceIndex !== -1) {
          setActiveCameraIndex(currentDeviceIndex);
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
  }, [stopStream, toast]);

  useEffect(() => {
    if (!isPreviewing) {
        getCameraPermission(cameras[activeCameraIndex]?.deviceId);
    }
    
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewing, activeCameraIndex]);

  const switchCamera = () => {
    if (cameras.length > 1) {
      const nextCameraIndex = (activeCameraIndex + 1) % cameras.length;
      setActiveCameraIndex(nextCameraIndex);
    }
  };

  const toggleFlash = useCallback(() => {
    if (!streamRef.current || !flashCapabilities.current?.torch) {
        toast({ variant: 'destructive', title: 'Flash not available on this camera.' });
        return;
    }
    const videoTrack = streamRef.current.getVideoTracks()[0];
    const newFlashState = !isFlashOn;
    videoTrack.applyConstraints({
        advanced: [{ torch: newFlashState }]
    })
    .then(() => {
        setIsFlashOn(newFlashState);
        toast({ title: `Flash turned ${newFlashState ? 'on' : 'off'}` });
    })
    .catch((e) => {
        console.error('Failed to toggle flash:', e);
        toast({ variant: 'destructive', title: 'Failed to toggle flash' });
    });
  }, [isFlashOn, toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        const videoTrack = streamRef.current?.getVideoTracks()[0];
        const isFrontFacing = videoTrack?.getSettings().facingMode === 'user';
        
        context.filter = getComputedStyle(video).filter;
        
        if (isFrontFacing) {
            context.translate(video.videoWidth, 0);
            context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopStream();
      }
    }
  };
  
  const startRecording = () => {
    if (streamRef.current && !mediaRecorderRef.current) {
      setIsRecording(true);
      setRecordingProgress(0);
      videoChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setCapturedVideo(videoUrl);
        stopStream();
        setIsRecording(false);
        if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        setRecordingProgress(0);
        startY.current = null;
      };

      mediaRecorderRef.current.start();
      
      const startTime = Date.now();
      recordingIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= MAX_VIDEO_DURATION) {
            stopRecording();
        } else {
            setRecordingProgress((elapsedTime / MAX_VIDEO_DURATION) * 100);
        }
      }, 100);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    startY.current = null;
  };
  
  const handlePressStart = (event: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
    const y = 'touches' in event ? event.touches[0].clientY : event.clientY;
    startY.current = y;
    pressTimerRef.current = setTimeout(() => {
        startRecording();
    }, 250); // Hold for 250ms to start recording
  };

  const handlePressEnd = () => {
    if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
    }
    if (isRecording) {
        stopRecording();
    } else {
        handleCapture();
    }
    startY.current = null;
  };

  const handleMove = (event: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
    if (!isRecording || startY.current === null || !zoomCapabilities.current || !streamRef.current) return;
  
    const y = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const deltaY = startY.current - y;
    
    const { min, max, step } = zoomCapabilities.current;
  
    // Map deltaY to a zoom level change
    const zoomChange = (deltaY / 100) * (max - min); // Adjust 100 to change sensitivity
    let newZoom = currentZoom.current + zoomChange;
    
    // Clamp the zoom level
    newZoom = Math.max(min, Math.min(newZoom, max));
  
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack && 'zoom' in videoTrack.getSettings()) {
      videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] })
        .catch(e => console.error("Zoom failed:", e));
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type.startsWith('image/')) {
            setCapturedImage(e.target?.result as string);
        } else if (file.type.startsWith('video/')) {
            setCapturedVideo(e.target?.result as string);
        }
        stopStream();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenSendTo = () => {
    if (capturedImage || capturedVideo) {
      setIsSendToSheetOpen(true);
    }
  };

  const handleToggleTarget = (id: string) => {
    setSelectedTargets(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const handleMultiSend = () => {
    const targets = Array.from(selectedTargets);
    if (targets.length === 0) return;

    let description = '';
    if (targets.includes('story')) description += 'Posted to story. ';
    if (targets.includes('public')) description += 'Posted publicly. ';
    
    const userTargets = targets.filter(t => t !== 'story' && t !== 'public');
    if (userTargets.length > 0) {
      description += `Sent to ${userTargets.length} friend${userTargets.length > 1 ? 's' : ''}.`;
    }

    toast({
      title: "Media Sent!",
      description: description.trim(),
    });
    
    setIsSendToSheetOpen(false);
    setSelectedTargets(new Set());
    setSendToSearchTerm('');
    router.push('/home');
  };

  const handleSave = () => {
    toast({
        title: 'Saved!',
        description: 'Your media has been saved to your device.',
    });
  }

  const allAppUsers = [currentUser, ...users];
  const mutualFollows = currentUser.following
    .map(followingId => allAppUsers.find(u => u.id === followingId))
    .filter((followedUser): followedUser is User => {
        if (!followedUser) return false;
        const otherUserFollowsBack = followedUser.following.includes(currentUser.id);
        return otherUserFollowsBack;
    })
    .filter(user => 
        user.name.toLowerCase().includes(sendToSearchTerm.toLowerCase()) || 
        (user.id && user.id.toLowerCase().includes(sendToSearchTerm.toLowerCase()))
    );

  const recentSends = mutualFollows.slice(0, 3);
  
  const areAllRecentsSelected = recentSends.every(user => selectedTargets.has(user.id));

  const handleToggleAllRecents = () => {
    const recentIds = recentSends.map(u => u.id);
    setSelectedTargets(prev => {
      const newSelection = new Set(prev);
      if (areAllRecentsSelected) {
        recentIds.forEach(id => newSelection.delete(id));
      } else {
        recentIds.forEach(id => newSelection.add(id));
      }
      return newSelection;
    });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setActiveFilter((prev) => (prev + 1) % filters.length);
    },
    onSwipedRight: () => {
      setActiveFilter((prev) => (prev - 1 + filters.length) % filters.length);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const videoTrack = streamRef.current?.getVideoTracks()[0];
  const isFrontFacing = videoTrack?.getSettings().facingMode === 'user';

  return (
     <div className="flex flex-col h-full bg-black text-white overflow-hidden">
        
        <main className="flex-1 flex flex-col items-center justify-center relative">
            {isPreviewing ? (
                <div className='relative w-full h-full flex flex-col' {...swipeHandlers}>
                    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
                      <Button variant="ghost" size="icon" onClick={() => { setCapturedImage(null); setCapturedVideo(null); }}>
                          <X className="h-6 w-6" />
                      </Button>
                      <h1 className="text-xl font-bold">Preview</h1>
                      <div className="h-6 w-6" />
                    </header>
                    <div className='relative flex-1 w-full'>
                         {capturedImage && <Image src={capturedImage} alt="Captured" layout="fill" className="object-contain" style={filters[activeFilter].style} />}
                         {capturedVideo && <video src={capturedVideo} loop playsInline muted autoPlay className="object-contain w-full h-full" style={filters[activeFilter].style}/>}
                    </div>
                    <footer className="p-4 z-10 bg-gradient-to-t from-black/50 to-transparent">
                      <div className='w-full flex items-center justify-between'>
                          <Button variant="ghost" className='text-base' onClick={handleSave}>
                              Save <Save className='ml-2 h-4 w-4' />
                          </Button>
                          <Button variant="default" className='text-base text-black' onClick={handleOpenSendTo}>
                              Send To <Send className='ml-2 h-4 w-4' />
                          </Button>
                      </div>
                    </footer>
                </div>
           ) : (
                <div 
                    className='relative w-full h-full bg-black flex flex-col items-center justify-center text-muted-foreground overflow-hidden'
                    {...swipeHandlers}
                >
                    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-transparent" />

                    {isRecording && (
                        <div className='absolute top-20 left-4 right-4 z-20'>
                            <Progress value={recordingProgress} className='h-1' />
                        </div>
                    )}
                    
                    <video ref={videoRef} className={cn("w-full h-full object-cover transition-all duration-300", isFrontFacing && '-scale-x-100')} autoPlay playsInline muted style={filters[activeFilter].style} />
                    
                    <div className='absolute top-1/4 right-2 flex flex-col gap-4 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm'>
                      <Button variant="ghost" size="icon" className="flex flex-col h-auto gap-1 text-white hover:bg-white/20 active:bg-white/30">
                          <Wand2 className="h-6 w-6" />
                           <span className="text-[10px]">Beauty</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="flex flex-col h-auto gap-1 text-white hover:bg-white/20 active:bg-white/30">
                          <Timer className="h-6 w-6" />
                           <span className="text-[10px]">Timer</span>
                      </Button>
                      {flashCapabilities.current?.torch && (
                        <Button variant="ghost" size="icon" onClick={toggleFlash} className={cn("flex flex-col h-auto gap-1 text-white hover:bg-white/20 active:bg-white/30", isFlashOn && "text-yellow-400 bg-white/10")}>
                           <Zap className="h-6 w-6" />
                            <span className="text-[10px]">Flash</span>
                       </Button>
                      )}
                      <Button variant="ghost" size="icon" className="flex flex-col h-auto gap-1 text-white hover:bg-white/20 active:bg-white/30">
                          <Wind className="h-6 w-6" />
                           <span className="text-[10px]">Speed</span>
                      </Button>
                       <Button variant="ghost" size="icon" className="flex flex-col h-auto gap-1 text-white hover:bg-white/20 active:bg-white/30">
                          <ChevronDown className="h-6 w-6" />
                           <span className="text-[10px]">More</span>
                      </Button>
                    </div>
                      
                    {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                          <Alert variant="destructive" className='w-auto m-4'>
                              <AlertTitle>Camera Access Required</AlertTitle>
                              <AlertDescription>
                                  Please allow camera access in your browser settings.
                              </AlertDescription>
                          </Alert>
                        </div>
                    )}
                    {hasCameraPermission === null && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <p>Requesting camera...</p>
                        </div>
                    )}
                    
                    <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 flex flex-col items-center gap-4">
                      <div className="w-full relative py-2">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex w-max space-x-4 justify-center px-4">
                                {filters.map((filter, index) => (
                                    <div key={filter.name} className="flex flex-col items-center gap-2" onClick={() => setActiveFilter(index)}>
                                        <div className={cn(
                                          "w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center transition-all duration-300", 
                                          activeFilter === index ? "border-white" : "border-transparent"
                                        )}>
                                            <div 
                                              className={cn(
                                                "w-10 h-10 bg-gray-500 rounded-full transition-transform transform",
                                                activeFilter === index ? 'scale-105' : 'scale-100'
                                              )} 
                                              style={{
                                                backgroundImage: `url(${currentUser.avatar.imageUrl})`,
                                                backgroundSize: 'cover',
                                                ...filter.style
                                              }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ScrollBar orientation='horizontal' className='invisible' />
                        </ScrollArea>
                      </div>

                      <div className="w-full flex items-center justify-around">
                          <Button variant="ghost" className="flex flex-col h-auto gap-1 text-white/80" onClick={handleFileUploadClick}>
                              <GalleryHorizontal className="h-6 w-6" />
                              <span className="text-xs">Upload</span>
                          </Button>
                          <div className="relative">
                            <div
                              className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200",
                                isRecording ? 'bg-red-500/50' : 'bg-transparent'
                              )}
                              onTouchStart={handlePressStart}
                              onTouchEnd={handlePressEnd}
                              onMouseDown={handlePressStart}
                              onMouseUp={handlePressEnd}
                              onTouchMove={handleMove}
                              onMouseMove={handleMove}
                            >
                                <div className={cn(
                                  "w-16 h-16 rounded-full border-4 border-white transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.6)]", 
                                  isRecording && "scale-75 bg-red-500 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.8)]"
                                  )} />
                            </div>
                          </div>
                           <Button variant="ghost" className="flex flex-col h-auto gap-1 text-white/80" onClick={switchCamera} disabled={cameras.length < 2}>
                              <RefreshCcw className="h-6 w-6" />
                              <span className="text-xs">Switch</span>
                          </Button>
                      </div>
                    </footer>
               </div>
           )}
        </main>
        
        <canvas ref={canvasRef} className="hidden"></canvas>
        <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
        />
        
        <Dialog open={isSendToSheetOpen} onOpenChange={setIsSendToSheetOpen}>
            <DialogContent className="sm:max-w-[425px] flex flex-col h-[80vh] p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Send</DialogTitle>
                    <DialogDescription>Share with your friends or post to your story.</DialogDescription>
                </DialogHeader>
                 <div className="relative px-6">
                    <Search className="absolute left-9 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search..." 
                        className="pl-10"
                        value={sendToSearchTerm}
                        onChange={(e) => setSendToSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-grow no-scrollbar">
                        <div className="px-6 space-y-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => handleToggleTarget('story')}
                            >
                                <div className='flex items-center gap-3'>
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <PlusCircle className='h-6 w-6 text-primary' />
                                    </div>
                                    <p className="font-semibold text-base">Your Story</p>
                                </div>
                                <Checkbox checked={selectedTargets.has('story')} />
                            </div>
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => handleToggleTarget('public')}
                            >
                                <div className='flex items-center gap-3'>
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <PlusCircle className='h-6 w-6 text-blue-500' />
                                    </div>
                                    <p className="font-semibold text-base">Post Publicly</p>
                                </div>
                                <Checkbox checked={selectedTargets.has('public')} />
                            </div>
                            
                            <Separator />

                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Recents</h3>
                                <Button
                                    variant="link"
                                    className="text-primary p-0 h-auto"
                                    onClick={handleToggleAllRecents}
                                >
                                    {areAllRecentsSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                            <ScrollArea className="whitespace-nowrap w-full">
                                <div className="flex w-max space-x-4 pb-4">
                                {recentSends.map(user => (
                                    <div key={`recent-${user.id}`} className="flex flex-col items-center gap-2 w-16 cursor-pointer" onClick={() => handleToggleTarget(user.id)}>
                                        <div className="relative">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {selectedTargets.has(user.id) && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full flex items-center justify-center h-5 w-5 border-2 border-background">
                                                    <Check className="h-3 w-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs truncate w-full text-center">{user.name}</p>
                                    </div>
                                ))}
                                </div>
                                <ScrollBar orientation='horizontal' className='invisible' />
                            </ScrollArea>
                            
                            <Separator />

                            <h3 className="font-semibold mb-2">Friends</h3>
                            <div className="space-y-4">
                                {mutualFollows.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => handleToggleTarget(user.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                
                                            </div>
                                        </div>
                                        <Checkbox checked={selectedTargets.has(user.id)} />
                                    </div>
                                ))}
                                {mutualFollows.length === 0 && (
                                    <div className="text-center text-muted-foreground pt-8">
                                        <p>No friends to show.</p>
                                        <p className="text-xs">Friends are users you follow who also follow you back.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
                 <DialogFooter className="p-4 border-t">
                    <Button 
                        className={cn("w-full", selectedTargets.size > 0 && 'shadow-lg shadow-primary/40')}
                        style={selectedTargets.size > 0 ? { 
                            boxShadow: '0 4px 15px hsl(var(--primary) / 0.4)',
                            textShadow: '0 0 5px hsl(var(--primary-foreground) / 0.5)'
                        } : {}}
                        disabled={selectedTargets.size === 0}
                        onClick={handleMultiSend}
                    >
                        Send {selectedTargets.size > 0 ? `to ${selectedTargets.size}` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}