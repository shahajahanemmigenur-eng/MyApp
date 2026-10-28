'use client';

import { useState, useEffect, useRef } from 'react';
import type { Story, User } from '@/lib/data';
import { currentUser } from '@/lib/data';
import Image from 'next/image';
import { Heart, Send, TrendingUp, Music, ChevronDown, Maximize, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn, formatNumber, formatDuration } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSwipeable } from 'react-swipeable';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

const reactions = [
  { name: 'Love', icon: <Heart className="h-6 w-6 text-red-500" /> },
  { name: 'Professional', icon: <TrendingUp className="h-6 w-6 text-blue-500" /> },
];

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StoryViewer({ story, onClose, onNext, onPrevious }: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  const storyDuration = 5000;
  const [selectedReaction, setSelectedReaction] = useState(reactions[0]);
  const [showReactions, setShowReactions] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isInsightsSheetOpen, setIsInsightsSheetOpen] = useState(false);

  const isCurrentUserStory = story.user.id === currentUser.id;
  const viewsCount = story.views?.length ?? 0;
  const likesCount = story.likers?.length ?? 0;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        const nextValue = prev + (100 / (storyDuration / 100));
        if (nextValue >= 100) {
          clearInterval(timer);
          return 100;
        }
        return nextValue;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused, storyDuration]);

  // Handle navigation side-effects safely outside the render cycle
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => onNext(), 0);
      return () => clearTimeout(timeout);
    }
  }, [progress, onNext]);

  const handleInteractionStart = () => {
    setIsPaused(true);
  };

  const handleInteractionEnd = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest('input')) {
      setIsPaused(false);
    }
    
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }

    const screenWidth = window.innerWidth;
    const clientX = 'touches' in e ? (e as React.TouchEvent).changedTouches[0].clientX : (e as React.MouseEvent).clientX;

    if (clientX < screenWidth / 2) {
      onPrevious();
    } else {
      onNext();
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (!isLiked) setSelectedReaction(reactions[0]);
  };

  const handleReactionSelect = (reaction: any) => {
    setIsLiked(true);
    setSelectedReaction(reaction);
    setShowReactions(false);
    toast({ title: `Reacted with ${reaction.name}` });
  };
  
  const handleLikeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleLikeMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!showReactions) {
       handleLikeClick(e);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (isCurrentUserStory) setIsInsightsSheetOpen(true);
    },
    onSwipedDown: onClose,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const remainingSeconds = Math.max(0, (storyDuration - (progress * storyDuration / 100)) / 1000);

  return (
    <Sheet open={isInsightsSheetOpen} onOpenChange={setIsInsightsSheetOpen}>
      <div
        className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden"
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        {...swipeHandlers}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Full Space Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/60 to-transparent space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <Progress value={progress} className="h-1 bg-white transition-none" />
              </div>
              <Badge variant="secondary" className="bg-black/40 text-white border-none font-mono text-[10px] py-0 px-1.5 h-4 backdrop-blur-sm">
                {Math.ceil(remainingSeconds)}s
              </Badge>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${story.user.id}`} onClick={(e) => { e.stopPropagation(); onClose(); }}>
                  <Avatar className="h-9 w-9 border-2 border-white/20">
                    <AvatarImage src={story.user.avatar.imageUrl} alt={story.user.name} />
                    <AvatarFallback>{story.user.name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex flex-col text-left">
                  <Link href={`/profile/${story.user.id}`} onClick={(e) => { e.stopPropagation(); onClose(); }} className="font-bold text-white text-sm">
                    {story.user.name}
                  </Link>
                  {story.song && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 uppercase tracking-tight">
                      <Music className="h-2.5 w-2.5" />
                      <span className="truncate max-w-[120px]">{story.song}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] border-white/30 text-white font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md">
                {formatDuration(storyDuration / 1000)} Length
              </Badge>
            </div>
          </div>
          
          {/* Immersive Main Media */}
          <div className="relative flex-1 bg-black">
            <Image
              src={story.image.imageUrl}
              alt={story.image.description}
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* Anchored Footer Controls */}
          <div className="p-4 pb-8 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            {isCurrentUserStory ? (
              <SheetTrigger asChild>
                <div className="flex flex-col justify-center items-center gap-1 text-white/90 cursor-pointer py-2 group active:scale-95 transition-transform">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-0.5">
                      <TrendingUp className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{formatNumber(viewsCount)}</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Heart className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{formatNumber(likesCount)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.2em] opacity-50">
                    <span>Swipe up for insights</span>
                    <ChevronDown className="h-2.5 w-2.5 rotate-180" />
                  </div>
                </div>
              </SheetTrigger>
            ) : (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl max-w-lg mx-auto w-full">
                <Input 
                  placeholder="Send message..."
                  className="bg-transparent text-white border-none focus-visible:ring-0 placeholder:text-white/50 text-sm h-10 px-4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                />
                <div className="flex items-center gap-1 pr-1">
                  <Popover open={showReactions} onOpenChange={setShowReactions}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/10 rounded-full h-9 w-9"
                        onMouseDown={handleLikeMouseDown}
                        onMouseUp={handleLikeMouseUp}
                        onTouchStart={(e) => handleLikeMouseDown(e as any)}
                        onTouchEnd={(e) => handleLikeMouseUp(e as any)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className={cn("transition-transform transform", isLiked ? 'scale-110' : 'scale-100')}>
                          {isLiked ? selectedReaction.icon : <Heart className="h-5 w-5" />}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="center" className="w-auto p-1.5 rounded-full bg-background/90 backdrop-blur-xl border-white/10 mb-2 shadow-2xl">
                      <div className="flex gap-1.5">
                        {reactions.map((reaction) => (
                          <button
                            key={reaction.name}
                            onClick={(e) => { e.stopPropagation(); handleReactionSelect(reaction); }}
                            className="p-2 rounded-full hover:bg-white/10 transition-all transform hover:scale-125 active:scale-90"
                          >
                            {reaction.icon}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-9 w-9" onClick={(e) => { e.stopPropagation(); if(comment.trim()) { toast({ title: 'Reply sent' }); setComment(''); } }}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SheetContent side="bottom" className="h-[60vh] flex flex-col rounded-t-3xl p-0 border-none bg-background/95 backdrop-blur-2xl z-[110]">
        <div className="mx-auto w-12 h-1 bg-muted rounded-full mt-3 shrink-0" />
        <SheetHeader className="text-center p-4 border-b">
          <SheetTitle className="text-base font-bold uppercase tracking-widest">Story Insights</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="views" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 border-b rounded-none">
            <TabsTrigger value="views" className="rounded-none py-3 text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
              Views ({formatNumber(viewsCount)})
            </TabsTrigger>
            <TabsTrigger value="likes" className="rounded-none py-3 text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
              Likes ({formatNumber(likesCount)})
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1">
            <TabsContent value="views" className="p-4 m-0">
               <UserListView userList={story.views} />
            </TabsContent>
            <TabsContent value="likes" className="p-4 m-0">
               <UserListView userList={story.likers} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function UserListView({ userList }: { userList: any[] | undefined }) {
  if (!userList || userList.length === 0) {
    return <p className="text-center text-muted-foreground p-8 font-bold text-xs uppercase opacity-50">No activity yet</p>
  }
  return (
    <div className="space-y-4">
      {userList.map(user => (
        <div key={user.id} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar.imageUrl} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-bold text-sm">{user.name}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">@{user.id}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
