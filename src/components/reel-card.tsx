'use client';

import { useState, useRef, useEffect } from 'react';
import type { Reel, Comment, User, Post } from '@/lib/data';
import { users, currentUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Play, 
  Volume2, 
  VolumeX, 
  Link as LinkIcon, 
  TrendingUp, 
  Repeat, 
  Forward, 
  Send, 
  Search, 
  Check, 
  X, 
  Share2, 
  Link2, 
  Ghost, 
  Mail, 
  MessageSquare, 
  Copy, 
  MoreVertical,
  Briefcase,
  Lock,
  Frown,
  BellOff,
  UserX,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { useVideoMute } from '@/context/video-mute-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, formatNumber, shortenTimestamp } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { VideoPlayer } from './video-player';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

const externalApps = [
  { name: 'Share via...', icon: Share2, bg: 'bg-muted' },
  { name: 'Copy link', icon: Link2, bg: 'bg-muted' },
  { name: 'Snapchat', icon: Ghost, bg: 'bg-[#FFFC00]', color: 'text-black' },
  { name: 'WhatsApp', icon: MessageSquare, bg: 'bg-[#25D366]', color: 'text-white' },
  { name: 'Gmail', icon: Mail, bg: 'bg-white', color: 'text-red-600' },
  { name: 'Telegram', icon: Send, bg: 'bg-[#0088cc]', color: 'text-white' },
];

export function ReelCard({ reel, clickable = true, repostedBy }: { reel: Reel, clickable?: boolean, repostedBy?: User }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isGloballyMuted, setGlobalMute, setActivePlayer } = useVideoMute();
  const { toast } = useToast();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [comments, setComments] = useState<Comment[]>(reel?.comments ?? []);
  const [isFollowed, setIsFollowed] = useState(currentUser.following.includes(reel.user.id));
  const [isLinked, setIsLinked] = useState(currentUser.connections.includes(reel.user.id));
  const [isVisible, setIsVisible] = useState(true);
  
  const [isRepostSheetOpen, setIsRepostSheetOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [shareSearchTerm, setShareSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [repostCount, setRepostCount] = useState(reel.shares || 0);
  const [isReposted, setIsReposted] = useState(false);

  useEffect(() => {
    const updatePersistentState = () => {
      const saved = localStorage.getItem(`saved_${reel.id}`);
      setIsBookmarked(saved === 'true');
      const liked = localStorage.getItem(`liked_${reel.id}`);
      setIsLiked(liked === 'true');

      const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
      setIsReposted(reposts.includes(reel.id));

      const storedCount = localStorage.getItem(`repostCount_${reel.id}`);
      if (storedCount) {
        setRepostCount(parseInt(storedCount, 10));
      } else {
        setRepostCount(reel.shares || 0);
      }

      const savedComments = localStorage.getItem(`comments_${reel.id}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    };

    updatePersistentState();
    window.addEventListener('storage', updatePersistentState);
    return () => window.removeEventListener('storage', updatePersistentState);
  }, [reel.id, reel.comments]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.userId === reel.user.id) {
        setIsLinked(currentUser.connections.includes(reel.user.id));
      }
    };
    window.addEventListener('sociverse:connections-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('sociverse:connections-updated', handleUpdate as EventListener);
  }, [reel.user.id]);

  useEffect(() => {
    if (captionRef.current) {
        setHasMore(captionRef.current.scrollHeight > captionRef.current.clientHeight);
    }
  }, [reel.caption]);

  if (!isVisible) return null;

  const handleTap = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!clickable) return;
    router.push(`/reels?id=${reel.id}`);
  };

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    localStorage.setItem(`liked_${reel.id}`, String(newLikedState));
    window.dispatchEvent(new Event('storage'));
  };

  const handleFollowToggle = (userId: string) => {
    const isNowFollowing = !currentUser.following.includes(userId);
    if (isNowFollowing) {
        currentUser.following.push(userId);
        toast({ title: `You are now following ${users.find(u => u.id === userId)?.name || userId}` });
    } else {
        currentUser.following = currentUser.following.filter(id => id !== userId);
        toast({ title: `You have unfollowed ${users.find(u => u.id === userId)?.name || userId}` });
    }
    if (userId === reel.user.id) {
        setIsFollowed(isNowFollowing);
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reel.user.id === currentUser.id) return;
    
    const targetUser = reel.user;
    const isCurrentlyLinked = currentUser.connections.includes(targetUser.id);
    
    if (isCurrentlyLinked) {
      currentUser.connections = currentUser.connections.filter(id => id !== targetUser.id);
      targetUser.connections = targetUser.connections.filter(id => id !== currentUser.id);
      setIsLinked(false);
      toast({ title: 'Unlinked!' });
    } else {
      currentUser.connections.push(targetUser.id);
      if (!targetUser.connections.includes(currentUser.id)) {
          targetUser.connections.push(currentUser.id);
      }
      setIsLinked(true);
      toast({ title: 'Linked!' });
    }
    
    window.dispatchEvent(new CustomEvent('sociverse:connections-updated', { 
      detail: { userId: targetUser.id } 
    }));
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isGloballyMuted;
  }, [isGloballyMuted]);

  const handleBookmark = (e: React.MouseEvent) => {
    e?.stopPropagation();
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    localStorage.setItem(`saved_${reel.id}`, String(newBookmarkState));
    window.dispatchEvent(new Event('storage'));
  };

  const handleRepostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReposted) {
      setIsReposted(false);
      const newCount = Math.max(0, repostCount - 1);
      setRepostCount(newCount);
      
      const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
      const filtered = reposts.filter((id: string) => id !== reel.id);
      localStorage.setItem(`reposts_${currentUser.id}`, JSON.stringify(filtered));
      localStorage.setItem(`repostCount_${reel.id}`, String(newCount));
      window.dispatchEvent(new Event('storage'));

      toast({ title: "Repost removed" });
    } else {
      setIsRepostSheetOpen(true);
      setNavVisibility(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareSheetOpen(true);
    setNavVisibility(false);
  };

  const onRepostOnly = () => {
    setIsReposted(true);
    const newCount = repostCount + 1;
    setRepostCount(newCount);

    const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
    if (!reposts.includes(reel.id)) {
      reposts.push(reel.id);
      localStorage.setItem(`reposts_${currentUser.id}`, JSON.stringify(reposts));
      localStorage.setItem(`repostCount_${reel.id}`, String(newCount));
      window.dispatchEvent(new Event('storage'));
    }

    toast({ title: "Reel reposted!" });
    setIsRepostSheetOpen(false);
    setNavVisibility(true);
  };

  const setNavVisibility = (visible: boolean) => {
    window.dispatchEvent(new CustomEvent('sociverse:nav-visibility', { detail: visible }));
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(shareSearchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(shareSearchTerm.toLowerCase())
  );

  const isActuallyRepost = !!repostedBy;
  const displayUser = repostedBy || reel.user;
  const nestedReel = isActuallyRepost ? reel : (reel as any).quotedPost;
  const hasNestedContent = !!nestedReel;

  return (
    <>
    <Card className="border-x-0 shadow-none sm:border-x rounded-none text-left relative overflow-hidden bg-background">
       <CardHeader className="flex flex-row items-center justify-between pl-[4px] pr-0 py-1">
          <div className="flex items-center gap-3">
            <Avatar user={displayUser} className="h-8 w-8">
                <AvatarImage src={displayUser.avatar.imageUrl} alt={displayUser.name} />
                <AvatarFallback>{displayUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                    <Link href={`/profile/${displayUser.id}`} className="font-bold text-sm hover:underline">{displayUser.name}</Link>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">{shortenTimestamp(isActuallyRepost ? 'now' : reel.timestamp)}</span>
                </div>
                {(isActuallyRepost || (reel as any).quotedPost) && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Repeat className="h-2.5 w-2.5 text-green-500" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Reposted</span>
                  </div>
                )}
            </div>
          </div>
          <div className="flex items-center gap-0">
            {displayUser.id !== currentUser.id && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "h-5 w-5 rounded-full transition-all shadow-sm shrink-0", 
                        isLinked ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-accent"
                    )} 
                    onClick={handleConnect}
                >
                    <LinkIcon className="h-3 w-3" />
                </Button>
            )}
            {displayUser.id !== currentUser.id && (
                <Button variant={isFollowed ? 'secondary' : 'outline'} size="sm" className="h-6 px-2.5 rounded-[6px] text-[10px] font-bold" onClick={() => handleFollowToggle(displayUser.id)}>
                {isFollowed ? 'Following' : 'Follow'}
                </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mx-1">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl bg-background/95 z-[70]">
                  <DropdownMenuItem className="rounded-xl focus:bg-accent transition-all duration-200 cursor-pointer py-2.5 px-3" onClick={() => toast({ title: "Not interested" })}>
                      <Frown className="h-4 w-4 mr-3" />
                      <span className="font-bold text-sm">Not interested</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl focus:bg-accent transition-all duration-200 cursor-pointer py-2.5 px-3" onClick={() => toast({ title: "Muted" })}>
                      <BellOff className="h-4 w-4 mr-3" />
                      <span className="font-bold text-sm">Mute this user post</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl focus:bg-destructive/10 focus:text-destructive transition-all duration-200 cursor-pointer py-2.5 px-3" onClick={() => toast({ title: "Blocked" })}>
                      <UserX className="h-4 w-4 mr-3" />
                      <span className="font-bold text-sm">Block this user account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl focus:bg-accent transition-all duration-200 cursor-pointer py-2.5 px-3" onClick={() => { setIsVisible(false); toast({ title: "Reel hidden" }); }}>
                      <EyeOff className="h-4 w-4 mr-3" />
                      <span className="font-bold text-sm">Hide this post</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </CardHeader>
      
      {(!isActuallyRepost || ((reel as any).quotedPost && reel.caption)) && (
        <div className="px-4 pb-3 text-sm leading-relaxed text-left">
          <div 
            ref={captionRef}
            className={cn(
              "text-sm w-full transition-all",
              !isExpanded && "line-clamp-[15]"
            )}
          >
            {reel.caption}
          </div>
          {hasMore && !isExpanded && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
              className="text-muted-foreground font-bold text-xs hover:text-primary transition-colors mt-1"
            >
              ... more
            </button>
          )}
        </div>
      )}

      {!isActuallyRepost && (
        <CardContent className="px-4 pb-0">
          <div className={cn("block relative w-full bg-black rounded-xl overflow-hidden", clickable && "cursor-pointer")} onClick={handleTap}>
              <VideoPlayer src={reel.videoUrl} className="w-full h-auto object-cover" />
              <Button onClick={(e) => { e.stopPropagation(); setGlobalMute(!isGloballyMuted); }} variant="ghost" size="icon" className="absolute top-3 right-3 text-white hover:bg-transparent bg-black/40 backdrop-blur-md rounded-full h-8 w-8 z-10">
                  {isGloballyMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
          </div>
        </CardContent>
      )}

      {hasNestedContent && (
          <div className="px-4 pt-2 pb-2">
              <div className="border rounded-2xl overflow-hidden bg-accent/5 transition-all shadow-sm">
                  <div className="p-2 border-b border-border/5 bg-accent/10 flex flex-row-reverse items-center justify-between">
                      <div className="flex flex-row-reverse items-center gap-2 overflow-hidden">
                        <Avatar className="h-5 w-5 border shrink-0">
                            <AvatarImage src={nestedReel.user.avatar.imageUrl} />
                        </Avatar>
                        <div className="flex flex-row-reverse items-center gap-1.5 min-w-0 text-right">
                            <span className="font-bold text-[11px] truncate text-foreground/90">{nestedReel.user.name}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Replying to</span>
                            <span className="text-[11px] text-primary font-bold truncate">@{nestedReel.user.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {nestedReel.user.id !== currentUser.id && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 rounded-full border border-border/20 bg-background/50 hover:bg-accent transition-colors shadow-sm"
                                onClick={(e) => { e.stopPropagation(); toast({ title: 'Linked!' }); }}
                            >
                                <LinkIcon className="h-2.5 w-2.5 text-muted-foreground" />
                            </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-5 px-2 rounded-full text-[9px] font-bold border-primary/20 text-primary hover:bg-primary/5"
                          onClick={(e) => { e.stopPropagation(); handleFollowToggle(nestedReel.user.id); }}
                        >
                            Follow
                        </Button>
                      </div>
                  </div>
                  <div className="p-3 text-left pl-3 bg-card/50 border-b border-border/5">
                     <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{nestedReel.caption}</p>
                  </div>
                  {(nestedReel.videoUrl || nestedReel.image || (nestedReel.images && nestedReel.images.length > 0)) && (
                    <div className="relative aspect-video bg-black/20">
                      {nestedReel.videoUrl ? (
                        <VideoPlayer src={nestedReel.videoUrl} />
                      ) : (nestedReel.image || (nestedReel.images && nestedReel.images.length > 0)) && (
                        <Image 
                          src={nestedReel.image?.imageUrl || nestedReel.images![0].imageUrl} 
                          fill 
                          className="object-cover" 
                          alt="" 
                        />
                      )}
                    </div>
                  )}
              </div>
          </div>
       )}

      <CardFooter className="flex flex-col items-start px-2 py-0 mt-1">
        <div className="flex justify-between w-full items-center px-2 py-1.5 gap-0.5 border-t border-border/5">
          <button className="flex items-center gap-1 justify-center text-foreground h-7 px-1 rounded-full flex-1 transition-none hover:bg-transparent">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-[8px] font-bold">{formatNumber(reel.views)}</span>
          </button>
          <button className={cn("flex items-center gap-1 justify-center transition-colors h-7 px-1 rounded-full flex-1", isLiked ? "text-primary" : "text-foreground")} onClick={() => handleLike()}>
            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-primary")} />
            <span className="text-[8px] font-bold">{formatNumber(reel.likes + (isLiked ? 1 : 0))}</span>
          </button>
          <button className="flex items-center gap-1 justify-center text-foreground h-7 px-1 rounded-full flex-1" onClick={() => router.push(`/post/${reel.id}/comments`)}>
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="text-[8px] font-bold">{formatNumber(comments.length)}</span>
          </button>
          <button className={cn("flex items-center gap-1 justify-center transition-colors h-7 px-1 rounded-full flex-1", (isReposted || isRepostSheetOpen) ? "text-primary" : "text-foreground")} onClick={handleRepostClick}>
            <Repeat className="h-3.5 w-3.5" />
            <span className="text-[8px] font-bold">{formatNumber(repostCount)}</span>
          </button>
          <button className="h-7 px-1 rounded-full flex items-center justify-center gap-1 text-foreground flex-1" onClick={handleShareClick}>
                <Forward className="h-3.5 w-3.5" />
          </button>
          <button className={cn("h-7 px-1 rounded-full flex items-center justify-center transition-colors flex-1", isBookmarked ? "text-primary" : "text-foreground")} onClick={(e) => handleBookmark(e)}>
            <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-primary")} />
          </button>
        </div>
      </CardFooter>
    </Card>

    <Sheet open={isRepostSheetOpen} onOpenChange={(open) => { setIsRepostSheetOpen(open); setNavVisibility(!open); }}>
        <SheetContent side="bottom" className="h-[32vh] rounded-t-[2.5rem] p-0 flex flex-col bg-background border-none shadow-2xl overflow-hidden fixed z-[70] bottom-0">
            <VisuallyHidden><SheetTitle>Repost Options</SheetTitle></VisuallyHidden>
            <div className="mx-auto w-12 h-1 bg-muted rounded-full mt-3 mb-1 shrink-0" />
            <div className="px-4 py-2 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <h3 className="font-bold text-xs text-center mb-3">Select Repost Type</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors border bg-card shadow-sm group active:scale-95" onClick={onRepostOnly}>
                      <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Repeat className="h-3.5 w-3.5 text-primary" /></div>
                      <div className="flex-1 text-left">
                          <p className="font-bold text-xs">Repost</p>
                          <p className="text-[10px] text-muted-foreground">Instantly share this to your feed</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors border bg-card shadow-sm group active:scale-95" onClick={() => { localStorage.setItem('quote_post', JSON.stringify(reel)); router.push('/quote'); setIsRepostSheetOpen(false); }}>
                      <div className="h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><MessageCircle className="h-3.5 w-3.5 text-blue-500" /></div>
                      <div className="flex-1 text-left">
                          <p className="font-bold text-xs">Quote Post</p>
                          <p className="text-[10px] text-muted-foreground">Give an advice</p>
                      </div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full font-bold h-8 rounded-xl mt-3 text-[10px]" onClick={() => setIsRepostSheetOpen(false)}>Cancel</Button>
            </div>
        </SheetContent>
    </Sheet>

    <Sheet open={isShareSheetOpen} onOpenChange={(open) => { setIsShareSheetOpen(open); setNavVisibility(!open); }}>
        <SheetContent side="bottom" className="h-[52vh] rounded-t-[2.5rem] p-0 flex flex-col bg-background border-none shadow-2xl overflow-hidden fixed z-[70] bottom-0">
            <VisuallyHidden><SheetTitle>Share with Friends</SheetTitle></VisuallyHidden>
            <div className="mx-auto w-12 h-1 bg-muted rounded-full mt-3 mb-1 shrink-0" />
            
            <div className="px-4 py-3 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search friends..." 
                      className="pl-9 h-10 bg-accent/30 border-none rounded-2xl"
                      value={shareSearchTerm}
                      onChange={(e) => setShareSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 px-4 no-scrollbar">
                <div className="py-2 border-b">
                   <ScrollArea className="w-full whitespace-nowrap">
                       <div className="flex w-max gap-4 pb-4">
                           {filteredUsers.map(user => {
                                const isSelected = selectedUsers.has(user.id);
                                return (
                                    <div key={user.id} className="flex flex-col items-center gap-1.5 shrink-0" onClick={() => toggleUserSelection(user.id)}>
                                        <div className="relative">
                                            <Avatar className={cn(
                                                "h-14 w-14 border-2 transition-all",
                                                isSelected ? "border-primary" : "border-transparent"
                                            )}>
                                                <AvatarImage src={user.avatar.imageUrl} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background animate-in zoom-in-50 duration-200">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold truncate w-14 text-center">{user.name}</span>
                                    </div>
                                );
                            })}
                       </div>
                       <ScrollBar orientation="horizontal" className="invisible" />
                   </ScrollArea>
                </div>

                <div className="py-4 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">External Apps</h4>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex w-max gap-4 pb-1">
                            {externalApps.map((app) => (
                                <div key={app.name} className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform shrink-0" onClick={() => { toast({ title: `Shared via ${app.name}` }); setIsShareSheetOpen(false); setNavVisibility(true); }}>
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shadow-md", app.bg, app.color || "text-white")}>
                                        <app.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-medium text-white/70">{app.name}</span>
                                </div>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="invisible" />
                    </ScrollArea>
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background shrink-0">
                <Button 
                    className="w-full font-bold h-11 rounded-2xl shadow-xl shadow-primary/20"
                    disabled={selectedUsers.size === 0}
                    onClick={() => {
                        toast({ title: `Shared with ${selectedUsers.size} friends!` });
                        setIsShareSheetOpen(false);
                        setNavVisibility(true);
                        setSelectedUsers(new Set());
                    }}
                >
                    Send {selectedUsers.size > 0 ? `to ${selectedUsers.size}` : ''}
                </Button>
            </div>
        </SheetContent>
    </Sheet>
    </>
  );
}
