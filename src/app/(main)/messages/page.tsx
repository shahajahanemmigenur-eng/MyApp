'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { users, currentUser } from "@/lib/data";
import type { User } from "@/lib/data";
import { Users, Search, Camera, Archive, BellOff, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IncomingAudioCall } from '@/components/incoming-audio-call';
import { IncomingVideoCall } from '@/components/incoming-video-call';
import { DialerScreen } from '@/components/dialer-screen';
import { VideoCallScreen } from '@/components/video-call-screen';
import { gsap } from 'gsap';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { StoryCarousel } from '@/components/story-carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const initialConversations = [
    { id: 'conv1', user: users[0], lastMessage: "Hey, how are you?", time: "2m ago", active: true, type: 'personal' },
    { id: 'conv2', user: users[1], lastMessage: "Let's catch up tomorrow.", time: "1h ago", active: false, type: 'personal' },
    { id: 'conv3', user: users[2], lastMessage: "See you at the meeting.", time: "yesterday", active: true, type: 'personal' },
    { id: 'conv4', user: users[3], lastMessage: "Can you send me the file?", time: "2 days ago", active: false, type: 'professional' },
    { id: 'conv5', user: users[4], lastMessage: "Thanks for the help!", time: "3 days ago", active: true, type: 'professional' },
    { id: 'conv6', user: users[0], lastMessage: "Just checking in!", time: "4 days ago", active: true, type: 'personal' },
    { id: 'conv7', user: users[1], lastMessage: "The project is going great.", time: "4 days ago", active: false, type: 'professional' },
    { id: 'conv8', user: users[3], lastMessage: "Got it, thanks!", time: "5 days ago", active: false, type: 'personal' },
    { id: 'conv9', user: users[2], lastMessage: "Running late, sorry!", time: "5 days ago", active: true, type: 'professional' },
    { id: 'conv10', user: users[4], lastMessage: "Happy Birthday!", time: "6 days ago", active: true, type: 'personal' },
    { id: 'conv11', user: users[0], lastMessage: "Did you see the news?", time: "1w ago", active: true, type: 'professional' },
    { id: 'conv12', user: users[2], lastMessage: "Let's grab lunch next week.", time: "1w ago", active: true, type: 'personal' },
    { id: 'conv13', user: users[4], lastMessage: "How was your trip?", time: "2w ago", active: true, type: 'professional' },
];

function ConversationList({ conversations = [], searchTerm }: { conversations: any[], searchTerm: string }) {
    const { toast } = useToast();
    const [convs, setConvs] = useState(conversations);
    const conversationRefs = useRef<{ [key: string]: HTMLDivElement }>({});
    const swipeStartX = useRef<number | null>(null);
    const activeSwipeId = useRef<string | null>(null);

    const filteredConvs = (convs || []).filter(conversation => 
        conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startSwipe = (e: React.MouseEvent | React.TouchEvent, convId: string) => {
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        swipeStartX.current = x;
        activeSwipeId.current = convId;
        document.body.style.overflowX = 'hidden';
        document.body.style.touchAction = 'none';
    };

    const onSwipe = (e: React.MouseEvent | React.TouchEvent) => {
        if (swipeStartX.current === null || activeSwipeId.current === null) return;
        
        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const deltaX = currentX - swipeStartX.current;
        const convElement = conversationRefs.current[activeSwipeId.current];

        if (convElement) {
            gsap.to(convElement, { x: deltaX, duration: 0.1 });
        }
    };

    const endSwipe = () => {
        if (swipeStartX.current === null || activeSwipeId.current === null) return;

        const convId = activeSwipeId.current;
        const convElement = conversationRefs.current[convId];
        if (!convElement) return;
        
        const finalX = gsap.getProperty(convElement, "x") as number;

        if (finalX > 80) { // Swiped right (Mute)
             gsap.to(convElement, { x: 80, duration: 0.2 });
        } else if (finalX < -80) { // Swiped left (Archive)
            gsap.to(convElement, { x: -80, duration: 0.2 });
        } else { // Return to center
            gsap.to(convElement, { x: 0, duration: 0.2 });
        }

        swipeStartX.current = null;
        activeSwipeId.current = null;
        document.body.style.overflowX = '';
        document.body.style.touchAction = '';
    };

    const handleMute = (convId: string) => {
        const conv = convs.find(c => c.id === convId);
        toast({ title: `Muted ${conv?.user.name}` });
        const convElement = conversationRefs.current[convId];
        if (convElement) gsap.to(convElement, { x: 0, duration: 0.2 });
    };

    const handleArchive = (convId: string) => {
        const convElement = conversationRefs.current[convId];
        if (convElement) {
            gsap.to(convElement, { 
                height: 0, 
                opacity: 0, 
                marginTop: 0, 
                marginBottom: 0, 
                paddingTop: 0, 
                paddingBottom: 0,
                duration: 0.3,
                onComplete: () => {
                    const conv = convs.find(c => c.id === convId);
                    toast({ title: `Archived chat with ${conv?.user.name}` });
                    setConvs(prev => prev.filter(c => c.id !== convId));
                }
            });
        }
    };
    
    useEffect(() => {
        window.addEventListener('mousemove', onSwipe as any);
        window.addEventListener('mouseup', endSwipe);
        window.addEventListener('touchmove', onSwipe as any);
        window.addEventListener('touchend', endSwipe);

        return () => {
            window.removeEventListener('mousemove', onSwipe as any);
            window.removeEventListener('mouseup', endSwipe);
            window.removeEventListener('touchmove', onSwipe as any);
            window.removeEventListener('touchend', endSwipe);
        };
    }, []);

    if (filteredConvs.length === 0 && searchTerm) {
        return <p className="text-center text-muted-foreground p-8">No results found for "{searchTerm}".</p>
    }
    
    if (filteredConvs.length === 0) {
        return <p className="text-center text-muted-foreground p-8">No messages yet.</p>
    }

    return (
        <div className="p-4">
            <div className="space-y-1">
                {filteredConvs.map((conversation) => (
                     <div key={conversation.id} className="relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 flex items-center">
                            <Button onClick={() => handleMute(conversation.id)} className="h-full w-20 bg-blue-500 hover:bg-blue-600 rounded-none flex-col gap-1">
                                <BellOff className="h-5 w-5" />
                                <span className="text-xs">Mute</span>
                            </Button>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            <Button onClick={() => handleArchive(conversation.id)} className="h-full w-20 bg-gray-500 hover:bg-gray-600 rounded-none flex-col gap-1">
                                <Archive className="h-5 w-5" />
                                <span className="text-xs">Archive</span>
                            </Button>
                        </div>

                        <div
                            ref={(el) => { if (el) conversationRefs.current[conversation.id] = el }}
                            className="relative bg-background z-10"
                            onMouseDown={(e) => startSwipe(e, conversation.id)}
                            onTouchStart={(e) => startSwipe(e, conversation.id)}
                        >
                            <Link href={`/messages/${conversation.user.id}`} className="block">
                                <div className="py-2 flex items-center justify-between gap-3 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={conversation.user.avatar.imageUrl} alt={conversation.user.name} data-ai-hint={conversation.user.avatar.imageHint} />
                                            <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{conversation.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{conversation.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function MessagesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'personal';

    const [conversations] = useState(initialConversations);
    const [incomingCall, setIncomingCall] = useState<{user: User, type: 'audio' | 'video'} | null>(null);
    const [callAccepted, setCallAccepted] = useState<null | 'audio' | 'video'>(null);
    const caller = incomingCall?.user;
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    useEffect(() => {
        const handleToggle = () => setIsSearchVisible(prev => !prev);
        window.addEventListener('sociverse:toggle-search', handleToggle);
        return () => window.removeEventListener('sociverse:toggle-search', handleToggle);
    }, []);

    useEffect(() => {
        if (!isSearchVisible) {
            setSearchTerm('');
        }
    }, [isSearchVisible]);

    const handleAccept = () => {
        if (!incomingCall) return;
        setCallAccepted(incomingCall.type);
        setIncomingCall(null);
    };

    const handleReject = () => {
        setIncomingCall(null);
        setCallAccepted(null);
    };

    const handleEndCall = () => {
        setCallAccepted(null);
    }
    
    if (incomingCall && !callAccepted) {
        if (incomingCall.type === 'audio') {
            return <IncomingAudioCall user={incomingCall.user} onAccept={handleAccept} onReject={handleReject} />
        }
        if (incomingCall.type === 'video') {
            return <IncomingVideoCall user={incomingCall.user} onAccept={handleAccept} onReject={handleReject} />
        }
    }
    
    if (callAccepted && caller) {
        if (callAccepted === 'audio') {
            return <DialerScreen user={caller} onEndCall={handleEndCall} />
        }
         if (callAccepted === 'video') {
            return <VideoCallScreen user={caller} onEndCall={handleEndCall} />
        }
    }
    
    const personalConversations = conversations.filter(c => c.type === 'personal');
    const professionalConversations = conversations.filter(c => c.type === 'professional');

    const handleTabChange = (value: string) => {
        router.push(`/messages?tab=${value}`);
    };

    return (
        <div className="flex flex-col">
               {isSearchVisible && (
                   <div className="p-3 border-b bg-card sticky top-0 z-20">
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                       <Input
                         placeholder="Search messages..."
                         className="pl-10 rounded-full"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         autoFocus
                       />
                     </div>
                   </div>
               )}
               <div className="py-2">
                    <StoryCarousel />
                </div>
            
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-auto p-0 bg-transparent rounded-none">
                        <TabsTrigger 
                            value="personal"
                            className="rounded-none bg-transparent py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                        >
                            Personal
                        </TabsTrigger>
                        <TabsTrigger 
                            value="professional"
                            className="rounded-none bg-transparent py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                        >
                            Professional
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal" className="mt-0">
                       <ConversationList conversations={personalConversations} searchTerm={searchTerm} />
                    </TabsContent>
                    <TabsContent value="professional" className="mt-0">
                       <ConversationList conversations={professionalConversations} searchTerm={searchTerm} />
                    </TabsContent>
                </Tabs>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
