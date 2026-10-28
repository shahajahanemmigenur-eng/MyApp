'use client';

import * as React from 'react';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { users, currentUser } from '@/lib/data';
import { ChevronLeft, Send, Phone, Video, Mic, Image as ImageIcon, Camera, Square, Info, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { DialerScreen } from '@/components/dialer-screen';
import { VideoCallScreen } from '@/components/video-call-screen';
import { LoaderCircle } from 'lucide-react';

type Message = {
    id: string;
    text?: string;
    audioUrl?: string;
    imageUrl?: string;
    senderId: string;
    timestamp: string;
};

function ChatContent({ userId, initialIsProfessional }: { userId: string, initialIsProfessional: boolean }) {
    const router = useRouter();
    const { toast } = useToast();
    const otherUser = users.find((u) => u.id === userId);
    const isProfessional = initialIsProfessional;

    const [messages, setMessages] = useState<Message[]>([
        { id: 'm1', text: 'Hey there! How\'s it going?', senderId: userId, timestamp: '10:00 AM' },
        { id: 'm2', text: 'Pretty good! Just working on a new project. You?', senderId: currentUser.id, timestamp: '10:01 AM' },
        { id: 'm3', text: 'Same here. Need a break though. Coffee soon?', senderId: userId, timestamp: '10:01 AM' },
        { id: 'm4', imageUrl: 'https://picsum.photos/seed/shared1/400/300', senderId: currentUser.id, timestamp: '10:05 AM' },
        { id: 'm5', text: 'Wow, great pic!', senderId: userId, timestamp: '10:06 AM' },
        { id: 'm6', imageUrl: 'https://picsum.photos/seed/shared2/300/400', senderId: userId, timestamp: '10:10 AM' },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [showTimestamps, setShowTimestamps] = useState(false);
    const pressTimer = useRef<NodeJS.Timeout | null>(null);

    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const swipeStartX = useRef<number | null>(null);
    const messageRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [showDialer, setShowDialer] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);

    useEffect(() => {
        if (isRecording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (event) => {
                        audioChunksRef.current.push(event.data);
                    };
                    mediaRecorderRef.current.onstop = () => {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        setAudioBlob(audioBlob);
                        audioChunksRef.current = [];
                        stream.getTracks().forEach(track => track.stop());
                    };
                    mediaRecorderRef.current.start();
                })
                .catch(err => {
                    console.error("Failed to get audio stream", err);
                    setIsRecording(false);
                    toast({
                        title: 'Recording Error',
                        description: 'Could not start audio recording. Please check microphone permissions.',
                        variant: 'destructive',
                    });
                });
        } else {
            mediaRecorderRef.current?.stop();
        }
    }, [isRecording, toast]);

    const handleStartRecording = () => {
        setAudioBlob(null);
        setIsRecording(true);
        toast({ title: 'Recording started...' });
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        toast({ title: 'Recording stopped.' });
    };
    
    const handleSendAudio = () => {
        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const message: Message = {
                id: `m${messages.length + 1}`,
                audioUrl: audioUrl,
                senderId: currentUser.id,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, message]);
            setAudioBlob(null);
        }
    };


    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const messageText = replyingTo
                ? `Replying to "${replyingTo.text}": ${newMessage}`
                : newMessage;

            const message: Message = {
                id: `m${messages.length + 1}`,
                text: messageText,
                senderId: currentUser.id,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, message]);
            setNewMessage('');
            setReplyingTo(null);
        }
    };

    const handleCall = (type: 'audio' | 'video') => {
        if (type === 'audio') {
            setShowDialer(true);
        } else {
            setShowVideoCall(true);
        }
    };

    const handlePressStart = () => {
        pressTimer.current = setTimeout(() => {
            setShowTimestamps(true);
        }, 500);
    };

    const handlePressEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
        }
        setShowTimestamps(false);
    };
    
    const startSwipe = (x: number) => {
        swipeStartX.current = x;
    };

    const onSwipe = (x: number, msgId: string) => {
        if (swipeStartX.current === null) return;

        const deltaX = x - swipeStartX.current;
        if (deltaX > 0 && messageRef.current[msgId]) { // Only swipe right
             messageRef.current[msgId]!.style.transform = `translateX(${Math.min(deltaX, 60)}px)`;
        }
    };

    const endSwipe = (msg: Message) => {
        if (swipeStartX.current === null || !messageRef.current[msg.id]) return;

        const finalTransform = messageRef.current[msg.id]?.style.transform;
        const finalTranslation = finalTransform ? parseFloat(finalTransform.replace(/translateX\((.+)px\)/, '$1')) : 0;
        
        if (finalTranslation > 40 && msg.text) { // Threshold for reply
            setReplyingTo(msg);
        }

        // Reset position smoothly
        if (messageRef.current[msg.id]) {
            messageRef.current[msg.id]!.style.transition = 'transform 0.2s ease-out';
            messageRef.current[msg.id]!.style.transform = 'translateX(0)';
        }
        
        setTimeout(() => {
            if (messageRef.current[msg.id]) {
                messageRef.current[msg.id]!.style.transition = '';
            }
        }, 200)

        swipeStartX.current = null;
    };


    if (!otherUser) {
        return notFound();
    }
    
    if (showDialer) {
        return <DialerScreen user={otherUser} onEndCall={() => setShowDialer(false)} />;
    }
    
    if (showVideoCall) {
        return <VideoCallScreen user={otherUser} onEndCall={() => setShowVideoCall(false)} />;
    }

    return (
        <div className="flex flex-col h-full bg-card">
            <header className="flex items-center justify-between p-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Link href={`/messages/${userId}/media`} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8" user={otherUser}>
                            <AvatarImage src={otherUser.avatar.imageUrl} alt={otherUser.name} data-ai-hint={otherUser.avatar.imageHint} />
                            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-base leading-none">{otherUser.name}</span>
                            {isProfessional && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Mail className="h-2.5 w-2.5 text-primary" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Professional</span>
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    {!isProfessional && (
                        <>
                            <Button variant="ghost" size="icon" onClick={() => handleCall('audio')}>
                                <Phone className="h-6 w-6" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCall('video')}>
                                <Video className="h-6 w-6" />
                            </Button>
                        </>
                    )}
                     <Button variant="ghost" size="icon" asChild>
                        <Link href={`/profile/${userId}`}>
                            <div className="flex h-10 w-10 items-center justify-center">
                                <span className="sr-only">Info</span>
                                <Info className="h-6 w-6" />
                            </div>
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-primary/20 to-accent/20 no-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex items-end gap-2 group",
                            msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                        )}
                    >
                         <div
                            className="relative flex items-end gap-2 w-full"
                            style={{
                                justifyContent: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {msg.senderId !== currentUser.id && (
                                <Avatar className="h-4 w-4 self-end" user={otherUser}>
                                    <AvatarImage src={otherUser.avatar.imageUrl} alt={otherUser.name} data-ai-hint={otherUser.avatar.imageHint}/>
                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}

                            <div className="flex items-center">
                                <div 
                                    ref={(el) => (messageRef.current[msg.id] = el)}
                                    onMouseDown={(e) => { handlePressStart(); if (msg.text) startSwipe(e.clientX); }}
                                    onMouseUp={() => { handlePressEnd(); endSwipe(msg); }}
                                    onMouseMove={(e) => onSwipe(e.clientX, msg.id)}
                                    onMouseLeave={() => endSwipe(msg)}
                                    onTouchStart={(e) => { handlePressStart(); if (msg.text) startSwipe(e.touches[0].clientX); }}
                                    onTouchMove={(e) => onSwipe(e.touches[0].clientX, msg.id)}
                                    onTouchEnd={() => { handlePressEnd(); endSwipe(msg); }}
                                    className="z-10"
                                >
                                     <div
                                        className={cn(
                                            "rounded-lg px-2.5 py-1.5 max-w-xs lg:max-w-md",
                                            msg.senderId === currentUser.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-accent text-accent-foreground',
                                            msg.imageUrl && 'p-0.5'
                                        )}
                                    >
                                        {msg.text && <p className="text-xs">{msg.text}</p>}
                                        {msg.audioUrl && <audio src={msg.audioUrl} controls className="h-8" />}
                                        {msg.imageUrl && (
                                            <Image 
                                                src={msg.imageUrl} 
                                                alt="sent image" 
                                                width={200} 
                                                height={200}
                                                className='rounded-md object-cover'
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            
                            {showTimestamps && (
                                <div className="text-xs text-muted-foreground w-16 text-right">
                                {msg.timestamp}
                                </div>
                            )}

                            {msg.senderId === currentUser.id && (
                                <Avatar className="h-4 w-4 self-end" user={currentUser}>
                                    <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.name} data-ai-hint={currentUser.avatar.imageHint} />
                                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </div>
                ))}
            </main>
            <footer className="p-3 border-t bg-transparent shrink-0">
                {replyingTo && (
                    <div className="p-2 mb-2 bg-muted rounded-md relative text-sm">
                        <div className='border-l-2 border-primary pl-2'>
                            <p className="font-semibold text-xs">{replyingTo.senderId === currentUser.id ? 'You' : otherUser.name}</p>
                            <p className="text-muted-foreground truncate">{replyingTo.text}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => setReplyingTo(null)}
                        >
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>
                )}
                 {audioBlob && !isRecording && (
                    <div className="flex items-center justify-between p-2 mb-2 bg-muted rounded-md">
                        <audio src={URL.createObjectURL(audioBlob)} controls className="h-8" />
                        <div className="flex gap-2">
                             <Button onClick={handleSendAudio} size="icon" className="h-8 w-8"><Send className="h-4 w-4" /></Button>
                             <Button onClick={() => setAudioBlob(null)} size="icon" variant="destructive" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                )}
                <div className="relative flex items-center flex-1">
                    <Button asChild variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary">
                        <Link href="/camera">
                            <Camera className="h-6 w-6" />
                        </Link>
                    </Button>

                     <Input
                        placeholder={isRecording ? "Recording..." : "Message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        className="pl-10 pr-24"
                        disabled={isRecording || !!audioBlob}
                    />
                     <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                        {newMessage.trim() && !isRecording && !audioBlob ? (
                            <Button onClick={handleSendMessage} size="icon" className="h-8 w-8 mr-1">
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        ) : (
                            <div className="flex items-center">
                                {isRecording ? (
                                     <Button onClick={handleStopRecording} variant="destructive" size="icon" className="h-8 w-8">
                                        <Square className="h-5 w-5" />
                                        <span className="sr-only">Stop recording</span>
                                    </Button>
                                ) : (
                                    <Button onClick={handleStartRecording} variant="ghost" size="icon" className="h-8 w-8" disabled={!!audioBlob}>
                                        <Mic className="h-5 w-5 text-muted-foreground" />
                                        <span className="sr-only">Record audio message</span>
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isRecording || !!audioBlob} asChild>
                                    <Link href="/camera">
                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                        <span className="sr-only">Send image</span>
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function ChatPage({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<{ tab?: string }> }) {
    const { userId } = React.use(params);
    const { tab } = React.use(searchParams);
    const isProfessional = tab === 'professional';
    
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <ChatContent userId={userId} initialIsProfessional={isProfessional} />
        </Suspense>
    );
}
