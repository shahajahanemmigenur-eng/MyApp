'use client';

import { useState, useRef, useEffect } from 'react';
import type { Post, Comment, User } from '@/lib/data';
import { users, currentUser } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Music, 
  Repeat, 
  Link as LinkIcon, 
  MapPin, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
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
import { useToast } from '@/hooks/use-toast';
import { cn, formatNumber, shortenTimestamp } from '@/lib/utils';
import { ProfilePictureDialog } from './profile-picture-dialog';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from './video-player';
import { useVideoMute } from '@/context/video-mute-context';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Input } from './ui/input';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Badge } from '@/components/ui/badge';

const externalApps = [
  { name: 'Share via...', icon: Share2, bg: 'bg-muted' },
  { name: 'Copy link', icon: Link2, bg: 'bg-muted' },
  { name: 'Snapchat', icon: Ghost, bg: 'bg-[#FFFC00]', color: 'text-black' },
  { name: 'WhatsApp', icon: MessageSquare, bg: 'bg-[#25D366]', color: 'text-white' },
  { name: 'Gmail', icon: Mail, bg: 'bg-white', color: 'text-red-600' },
  { name: 'Telegram', icon: Send, bg: 'bg-[#0088cc]', color: 'text-white' },
];

export function ActivityPostCard({ post: initialPost, clickable = true, repostedBy }: { post: Post, clickable?: boolean, repostedBy?: User }) {
  const router = useRouter();
  const captionRef = useRef<HTMLParagraphElement>(null);
  const { isGloballyMuted, setGlobalMute } = useVideoMute();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialPost?.comments || []);
  const { toast } = useToast();
  
  const [isFollowed, setIsFollowed] = useState(initialPost ? currentUser.following.includes(initialPost.user.id) : false);
  const [isLinked, setIsLinked] = useState(initialPost ? currentUser.connections.includes(initialPost.user.id) : false);
  const [isVisible, setIsVisible] = useState(true);

  const [repostCount, setRepostCount] = useState(initialPost?.repostCount || 0);
  const [isReposted, setIsReposted] = useState(false);
  const [isRepostSheetOpen, setIsRepostSheetOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [shareSearchTerm, setShareSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!initialPost?.id) return;
    const updatePersistentState = () => {
      const saved = localStorage.getItem(`saved_${initialPost.id}`);
      setIsBookmarked(saved === 'true');
      const liked = localStorage.getItem(`liked_${initialPost.id}`);
      setIsLiked(liked === 'true');
      
      const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
      setIsReposted(reposts.includes(initialPost.id));

      const storedCount = localStorage.getItem(`repostCount_${initialPost.id}`);
      if (storedCount) {
        setRepostCount(parseInt(storedCount, 10));
      } else {
        setRepostCount(initialPost.repostCount || 0);
      }

      const savedComments = localStorage.getItem(`comments_${initialPost.id}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    };

    updatePersistentState();
    window.addEventListener('storage', updatePersistentState);
    return () => window.removeEventListener('storage', updatePersistentState);
  }, [initialPost?.id]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.userId === initialPost.user.id) {
        setIsLinked(currentUser.connections.includes(initialPost.user.id));
      }
    };
    window.addEventListener('sociverse:connections-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('sociverse:connections-updated', handleUpdate as EventListener);
  }, [initialPost.user.id]);

  useEffect(() => {
    if (captionRef.current) {
      setHasMore(captionRef.current.scrollHeight > captionRef.current.clientHeight);
    }
  }, [initialPost?.caption]);

  if (!initialPost || !initialPost.user || !isVisible) return null;

  const handleFollowToggle = (userId: string) => {
    const isNowFollowing = !currentUser.following.includes(userId);
    if (isNowFollowing) {
        currentUser.following.push(userId);
        toast({ title: `You are now following ${users.find(u => u.id === userId)?.name || userId}` });
    } else {
        currentUser.following = currentUser.following.filter(id => id !== userId);
        toast({ title: `You have unfollowed ${users.find(u => u.id === userId)?.name || userId}` });
    }
    if (userId === initialPost.user.id) {
        setIsFollowed(isNowFollowing);
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (initialPost.user.id === currentUser.id) return;
    
    const targetUser = initialPost.user;
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

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    localStorage.setItem(`liked_${initialPost.id}`, String(newLikedState));
    window.dispatchEvent(new Event('storage'));
  };

  const handleBookmark = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    localStorage.setItem(`saved_${initialPost.id}`, String(newBookmarkState));
    window.dispatchEvent(new Event('storage'));
  };

  const handleRepostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReposted) {
      setIsReposted(false);
      const newCount = Math.max(0, repostCount - 1);
      setRepostCount(newCount);
      
      const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
      const filtered = reposts.filter((id: string) => id !== initialPost.id);
      localStorage.setItem(`reposts_${currentUser.id}`, JSON.stringify(filtered));
      localStorage.setItem(`repostCount_${initialPost.id}`, String(newCount));
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
    if (!reposts.includes(initialPost.id)) {
      reposts.push(initialPost.id);
      localStorage.setItem(`reposts_${currentUser.id}`, JSON.stringify(reposts));
      localStorage.setItem(`repostCount_${initialPost.id}`, String(newCount));
      window.dispatchEvent(new Event('storage'));
    }

    toast({ title: "Post reposted!" });
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

  const images = initialPost.images || (initialPost.image ? [initialPost.image] : []);

  const mediaElement = initialPost.videoUrl ? (
      <VideoPlayer src={initialPost.videoUrl} className="w-full h-auto object-cover" />
  ) : images.length > 1 ? (
      <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
              {images.map((img, index) => (
                  <CarouselItem key={img.id}>
                      <div className="relative aspect-[4/5] w-full">
                          <Image
                              src={img.imageUrl}
                              alt={img.description}
                              fill
                              className="object-contain"
                              data-ai-hint={img.imageHint}
                          />
                      </div>
                  </CarouselItem>
              ))}
          </CarouselContent>
          {count > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold rounded-full px-2.5 py-1 z-10 backdrop-blur-md">
                  {current}/{count}
              </div>
          )}
      </Carousel>
  ) : images.length === 1 ? (
      <div className="relative w-full">
          <Image
              src={images[0].imageUrl}
              alt={images[0].description}
              width={1080}
              height={1350}
              className="w-full h-auto object-contain"
              data-ai-hint={images[0].imageHint}
          />
      </div>
  ) : null;

  const isActuallyRepost = !!repostedBy;
  const displayUser = repostedBy || initialPost.user;
  const nestedPost = isActuallyRepost ? initialPost : initialPost.quotedPost;
  const hasNestedContent = !!nestedPost;

  return (
    <>
    <Card className="border-x-0 shadow-none sm:border-x w-full mx-auto rounded-none text-left bg-background overflow-hidden">
       <CardHeader className="flex flex-row items-center justify-between pl-[4px] pr-0 py-1">
          <div className="flex items-center gap-3">
            <ProfilePictureDialog user={displayUser} open={false} onOpenChange={() => {}}>
              <Avatar user={displayUser} className="h-8 w-8">
                  <AvatarImage src={displayUser.avatar.imageUrl} alt={displayUser.name} data-ai-hint={displayUser.avatar.imageHint} />
                  <AvatarFallback>{displayUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </ProfilePictureDialog>
            <div className="flex flex-col items-start leading-tight text-left">
                <div className="flex items-center gap-1.5">
                    <Link href={`/profile/${displayUser.id}`} className="font-bold text-sm hover:underline">{displayUser.name}</Link>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{shortenTimestamp(isActuallyRepost ? 'now' : initialPost.timestamp)}</span>
                </div>
                {(isActuallyRepost || initialPost.quotedPost) && (
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
                <Button variant={isFollowed ? "secondary" : "outline"} size="sm" onClick={() => handleFollowToggle(displayUser.id)} className="h-6 px-2.5 rounded-[6px] text-[10px] font-bold">
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
                  <DropdownMenuItem className="rounded-xl focus:bg-accent transition-all duration-200 cursor-pointer py-2.5 px-3" onClick={() => { setIsVisible(false); toast({ title: "Post hidden" }); }}>
                      <EyeOff className="h-4 w-4 mr-3" />
                      <span className="font-bold text-sm">Hide this post</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
       </CardHeader>

       {(!isActuallyRepost || (initialPost.quotedPost && initialPost.caption)) && (
         <div className="px-4 pb-2 text-[14px] leading-relaxed text-left">
           <p 
             ref={captionRef}
             className={cn(
               "whitespace-pre-wrap",
               !isExpanded && "line-clamp-[15]"
             )}
           >
             {initialPost.caption}
           </p>
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

       {(!isActuallyRepost && (initialPost.images || initialPost.image || initialPost.videoUrl)) && (
         <CardContent className="px-4 pb-0">
             <div className="relative w-full overflow-hidden mx-auto rounded-xl bg-muted" onDoubleClick={() => handleLike()}>
                 {initialPost.videoUrl && (
                   <Button 
                    onClick={(e) => { e.stopPropagation(); setGlobalMute(!isGloballyMuted); }} 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3 text-white hover:bg-transparent bg-black/40 backdrop-blur-md rounded-full h-8 w-8 z-10"
                   >
                     {isGloballyMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                   </Button>
                 )}
                 {clickable ? (
                   <Link href={`/post/${initialPost.id}`} className="block w-full">
                       {mediaElement}
                   </Link>
                 ) : (
                   <div className="block w-full">{mediaElement}</div>
                 )}
             </div>
         </CardContent>
       )}

       {hasNestedContent && (
          <div className="px-4 pt-2 pb-2">
              <div className="border rounded-2xl overflow-hidden bg-accent/5 transition-all shadow-sm">
                  <div className="p-2 border-b border-border/5 bg-accent/10 flex flex-row-reverse items-center justify-between">
                      <div className="flex flex-row-reverse items-center gap-2 overflow-hidden">
                        <Avatar className="h-5 w-5 border shrink-0">
                            <AvatarImage src={nestedPost.user.avatar.imageUrl} />
                        </Avatar>
                        <div className="flex flex-row-reverse items-center gap-1.5 min-w-0 text-right">
                            <span className="font-bold text-[11px] truncate text-foreground/90">{nestedPost.user.name}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Replying to</span>
                            <span className="text-[11px] text-primary font-bold truncate">@{nestedPost.user.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {nestedPost.user.id !== currentUser.id && (
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
                          onClick={(e) => { e.stopPropagation(); handleFollowToggle(nestedPost.user.id); }}
                        >
                            Follow
                        </Button>
                      </div>
                  </div>
                  <div className="p-3 text-left pl-3 bg-card/50 border-b border-border/5">
                     <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{nestedPost.caption}</p>
                  </div>
                  {(nestedPost.image || nestedPost.videoUrl || (nestedPost.images && nestedPost.images.length > 0)) && (
                    <div className="relative aspect-video bg-black/20">
                      {nestedPost.videoUrl ? (
                        <VideoPlayer src={nestedPost.videoUrl} />
                      ) : (nestedPost.image || (nestedPost.images && nestedPost.images.length > 0)) && (
                        <Image 
                          src={nestedPost.image?.imageUrl || nestedPost.images![0].imageUrl} 
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

      <CardFooter className="flex flex-col items-start px-1 py-0 mt-1">
        <div className="flex justify-between w-full items-center px-1 py-1.5 gap-0 border-t border-border/5">
            <button className="flex items-center justify-center gap-1 text-foreground h-7 px-1 rounded-full flex-1 transition-none">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[8px] font-bold">{formatNumber(initialPost.views)}</span>
            </button>
            <button className={cn("flex items-center justify-center gap-1 transition-colors h-7 px-1 rounded-full flex-1", isLiked ? "text-red-500" : "text-foreground")} onClick={() => handleLike()}>
                <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                <span className="text-[8px] font-bold">{formatNumber(initialPost.likes + (isLiked ? 1 : 0))}</span>
            </button>
            <button className="flex items-center justify-center gap-1 text-foreground h-7 px-1 rounded-full flex-1" onClick={() => router.push(`/post/${initialPost.id}/comments`)}>
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="text-[8px] font-bold">{formatNumber(comments.length)}</span>
            </button>
            <button className={cn("flex items-center justify-center gap-1 transition-colors h-7 px-1 rounded-full flex-1", (isReposted || isRepostSheetOpen) && "text-green-500")} onClick={handleRepostClick}>
                <Repeat className="h-3.5 w-3.5" />
                <span className="text-[8px] font-bold">{formatNumber(repostCount)}</span>
            </button>
            <button className="text-foreground transition-colors h-7 px-1 rounded-full flex-1 flex items-center justify-center" onClick={handleShareClick}>
                <Forward className="h-3.5 w-3.5" />
            </button>
            <button className={cn("transition-colors h-7 px-1 rounded-full flex-1 flex items-center justify-center", isBookmarked ? "text-primary" : "text-foreground")} onClick={handleBookmark}>
                <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-primary")} />
            </button>
        </div>
      </CardFooter>
    </Card>

    <Sheet open={isRepostSheetOpen} onOpenChange={(open) => { setIsRepostSheetOpen(open); setNavVisibility(!open); }}>
        <SheetContent side="bottom" className="h-[32vh] rounded-t-[2rem] p-0 flex flex-col bg-background border-none shadow-2xl overflow-hidden fixed z-[70] bottom-0">
            <VisuallyHidden><SheetTitle>Repost Options</SheetTitle></VisuallyHidden>
            <div className="mx-auto w-12 h-1 bg-muted rounded-full mt-3 mb-1 shrink-0" />
            <div className="px-4 py-2 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <h3 className="font-bold text-xs text-center mb-3">Select Repost Type</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors border bg-card shadow-sm group active:scale-95" onClick={onRepostOnly}>
                      <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Repeat className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1 text-left">
                          <p className="font-bold text-xs">Repost</p>
                          <p className="text-[10px] text-muted-foreground">Instantly share this to your feed</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors border bg-card shadow-sm group active:scale-95" onClick={() => { localStorage.setItem('quote_post', JSON.stringify(initialPost)); router.push('/quote'); setIsRepostSheetOpen(false); }}>
                      <div className="h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><MessageCircle className="h-5 w-5 text-blue-500" /></div>
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
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shadow-md", app.bg, app.color || "text-foreground")}>
                                        <app.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-bold text-center leading-tight">{app.name}</span>
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
