'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { currentUser, users } from '@/lib/data';
import type { Reel, Comment, User } from '@/lib/data';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Play, 
  Pause,
  Forward, 
  MoreVertical,
  Search,
  TrendingUp,
  Link as LinkIcon,
  UserPlus,
  UserCheck,
  ChevronDown,
  X,
  Music,
  Check,
  Ghost,
  Mail,
  MessageSquare,
  Link2,
  Share2,
  Send,
  Frown,
  BellOff,
  UserX,
  EyeOff,
  Trash2,
  Paperclip,
  Repeat,
  Volume2,
  VolumeX
} from 'lucide-react';
import Image from 'next/image';
import { useVideoMute } from '@/context/video-mute-context';
import { cn, formatNumber, shortenTimestamp, formatDuration } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSwipeable } from 'react-swipeable';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Progress } from './ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const externalApps = [
  { name: 'Share via...', icon: Share2, bg: 'bg-white/10' },
  { name: 'Copy link', icon: Link2, bg: 'bg-white/10' },
  { name: 'Snapchat', icon: Ghost, bg: 'bg-[#FFFC00]', color: 'text-black' },
  { name: 'WhatsApp', icon: MessageSquare, bg: 'bg-[#25D366]', color: 'text-white' },
  { name: 'Gmail', icon: Mail, bg: 'bg-white', color: 'text-red-600' },
  { name: 'Telegram', icon: Send, bg: 'bg-[#0088cc]', color: 'text-white' },
];

const dummyComments: Comment[] = [
  { 
    id: 'd1', 
    user: users[0], 
    text: 'Consider starting a small manufacturing business. It has huge potential for long-term growth. 🚀', 
    likes: 24,
    timestamp: '1h',
    replies: [
        { id: 'dr1', user: users[1], text: 'I agree. Which manufacturing sector would you recommend?', likes: 5, timestamp: '45m' },
        { id: 'dr2', user: users[2], text: 'Food processing could be a good option.', likes: 3, timestamp: '30m' }
    ]
  },
  { 
    id: 'd2', 
    user: users[1], 
    text: 'Great content, keep it up! ✨', 
    likes: 8,
    timestamp: '2h'
  },
];

interface CommentItemProps {
    comment: Comment;
    onReply: (comment: Comment) => void;
    level?: number;
    onDelete?: (id: string) => void;
    onFollowToggle: (userId: string) => void;
    isFollowed: boolean;
    parentComment?: Comment;
}

type SheetView = 'comments' | 'share' | 'repost';

function CommentItem({ comment, onReply, level = 0, onDelete, onFollowToggle, isFollowed, parentComment }: CommentItemProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isReposted, setIsReposted] = useState(false);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const [showReplies, setShowReplies] = useState(false);
    const { toast } = useToast();

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
    };

    const handleRepost = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsReposted(!isReposted);
        toast({ title: isReposted ? "Repost removed" : "Comment reposted!" });
    };

    const isMe = comment.user.id === currentUser.id;
    const isReply = level > 0;

    return (
        <div className={cn(
            "flex flex-col w-full py-1",
            isReply ? "items-start pl-4 mr-auto" : "items-end pr-4 ml-auto"
        )}>
            <div className={cn(
                "flex flex-col gap-1 p-1.5 rounded-2xl transition-colors group relative w-[96%] bg-primary/5 shadow-sm",
                isReply ? "mr-auto rounded-tl-none border-l-2 border-primary" : "ml-auto rounded-tr-none border-r-2 border-primary"
            )}>
                <div className={cn(
                    "flex items-center justify-between gap-4 w-full",
                    !isReply && "flex-row-reverse"
                )}>
                    <div className={cn(
                        "flex items-center gap-2",
                        !isReply && "flex-row-reverse"
                    )}>
                        <Avatar className="h-8 w-8 border shrink-0">
                            <AvatarImage src={comment.user.avatar.imageUrl} />
                            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                            "flex flex-col",
                            !isReply ? "items-end text-right" : "items-start text-left"
                        )}>
                            <span className="text-[13px] font-bold truncate">{comment.user.name}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                {shortenTimestamp(comment.timestamp || '1h')}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {!isMe && (
                             <button 
                                className={cn(
                                    "h-5 px-2 rounded-[4px] text-[10px] font-bold border transition-colors",
                                    isFollowed ? "bg-secondary text-secondary-foreground border-transparent" : "bg-transparent text-foreground border-border hover:bg-accent"
                                )}
                                onClick={(e) => { e.stopPropagation(); onFollowToggle(comment.user.id); }}
                            >
                                {isFollowed ? 'Following' : 'Follow'}
                            </button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-6 w-6 text-muted-foreground flex items-center justify-center rounded-full hover:bg-accent transition-colors">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isReply ? "start" : "end"} className="w-44 rounded-xl p-1 shadow-xl border-border/40 backdrop-blur-xl bg-background/95 z-[120]">
                                <DropdownMenuItem className="rounded-xl text-xs font-bold py-2.5 px-3 cursor-pointer">Report</DropdownMenuItem>
                                {isMe && (
                                    <DropdownMenuItem className="rounded-xl text-xs font-bold py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete?.(comment.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className={cn(
                    "flex flex-col gap-1 w-full",
                    !isReply ? "items-end text-right" : "items-start text-left"
                )}>
                    {comment.text && <p className="text-[14.5px] leading-snug whitespace-pre-wrap">{comment.text}</p>}
                    
                    {comment.imageUrl && (
                        <div className="relative aspect-square w-full max-w-[240px] rounded-lg overflow-hidden mt-1 bg-muted">
                            <Image src={comment.imageUrl} alt="Attached content" fill className="object-cover" />
                        </div>
                    )}

                    {parentComment && (
                        <div className={cn(
                            "mt-1 p-1.5 rounded-lg bg-accent/10 border-primary text-[11px] text-muted-foreground max-w-full animate-in fade-in slide-in-from-top-1",
                            isReply ? "border-l-2 text-left" : "border-r-2 text-right"
                        )}>
                            <p className="font-bold uppercase tracking-tighter text-[9px] mb-0.5 opacity-70">Replaying to @{parentComment.user.id}</p>
                            <p className="line-clamp-1 italic opacity-80">"{parentComment.text}"</p>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center justify-between pt-1 border-t border-border/10 w-full">
                    <div className={cn("flex items-center justify-between w-full px-0.5", !isReply && "flex-row-reverse")}>
                        <button className="flex items-center gap-1 text-muted-foreground transition-colors">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-[8px] font-bold">120</span>
                        </button>
                        <button onClick={handleLike} className={cn("flex items-center gap-1 transition-colors", isLiked ? "text-red-500" : "text-muted-foreground")}>
                            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                            <span className="text-[9px] font-bold">{formatNumber((comment.likes || 0) + (isLiked ? 1 : 0))}</span>
                        </button>
                        <button onClick={() => onReply(comment)} className="flex items-center gap-1 text-muted-foreground transition-colors">
                            <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={handleRepost} className={cn("text-muted-foreground transition-colors", isReposted && "text-green-500")}>
                            <Repeat className="h-3.5 w-3.5" />
                        </button>
                        <button className="text-muted-foreground transition-colors" onClick={() => toast({ title: "Sharing comment..." })}>
                            <Forward className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={handleBookmark} className={cn("transition-colors", isBookmarked ? "text-primary" : "text-muted-foreground")}>
                            <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-primary")} />
                        </button>
                    </div>
                </div>
            </div>

            {hasReplies && (
                <button 
                    onClick={() => setShowReplies(!showReplies)}
                    className={cn(
                        "flex items-center gap-2 mt-1 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors",
                        isReply ? "pl-2" : "pr-2 flex-row-reverse"
                    )}
                >
                    <div className="w-4 h-[1px] bg-border/60" />
                    {showReplies ? "Hide replies" : `View ${comment.replies!.length} more replies`}
                </button>
            )}

            {showReplies && hasReplies && (
                <div className="flex flex-col w-full mt-1">
                    {comment.replies!.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            onReply={onReply} 
                            level={level + 1} 
                            onDelete={onDelete}
                            onFollowToggle={onFollowToggle}
                            isFollowed={currentUser.following.includes(reply.user.id)}
                            parentComment={comment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function ReelPlayer({ reel }: { reel: Reel }) {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isGloballyMuted, setGlobalMute, setActivePlayer } = useVideoMute();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState(false);
  const [activeSheetView, setActiveSheetView] = useState<SheetView>('comments');
  const [shareSearchTerm, setShareSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const [isFollowed, setIsFollowed] = useState(currentUser.following.includes(reel.user.id));
  const [isLinked, setIsLinked] = useState(currentUser.connections.includes(reel.user.id));
  const [repostCount, setRepostCount] = useState(reel.shares || 0);
  const [isReposted, setIsReposted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const updatePersistentState = () => {
      const saved = localStorage.getItem(`saved_${reel.id}`);
      setIsBookmarked(saved === 'true');
      const liked = localStorage.getItem(`liked_${reel.id}`);
      setIsLiked(liked === 'true');

      const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
      setIsReposted(reposts.includes(reel.id));

      const savedComments = localStorage.getItem(`comments_${reel.id}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      } else {
        setComments(reel.comments.length > 0 ? reel.comments : dummyComments);
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
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (video.readyState >= 1) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            const video = videoRef.current;
            if (!video) return;

            if (entry.isIntersecting) {
                setActivePlayer(videoRef);
                video.muted = isGloballyMuted;
                if (!reel?.videoUrl || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || video.error) {
                    setIsPlaying(false);
                    return;
                }
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => setIsPlaying(true))
                        .catch((error) => {
                            if (
                                error.name !== 'AbortError' &&
                                error.name !== 'NotAllowedError' &&
                                error.name !== 'NotSupportedError' &&
                                !error.message?.includes('no supported sources')
                            ) {
                                console.error("Autoplay failed:", error);
                            }
                            setIsPlaying(false);
                        });
                }
            } else {
                if (!video.paused) {
                    video.pause();
                }
                setIsPlaying(false);
            }
        },
        { threshold: 0.6 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [setActivePlayer, isGloballyMuted, reel?.videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        if (!reel?.videoUrl || videoRef.current.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || videoRef.current.error) {
          setIsPlaying(false);
          return;
        }
        videoRef.current.play().then(() => setIsPlaying(true)).catch((error) => {
          if (
              error.name !== 'AbortError' &&
              error.name !== 'NotAllowedError' &&
              error.name !== 'NotSupportedError' &&
              !error.message?.includes('no supported sources')
          ) {
              console.error("Play failed:", error);
          }
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    localStorage.setItem(`liked_${reel.id}`, String(newLikedState));
    window.dispatchEvent(new Event('storage'));
  };

  const openInteractionSheet = (view: SheetView) => {
    setActiveSheetView(view);
    setIsInteractionSheetOpen(true);
    setNavVisibility(false);
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
      setRepostCount(prev => Math.max(0, prev - 1));
      
      const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
      const filtered = reposts.filter((id: string) => id !== reel.id);
      localStorage.setItem(`reposts_${currentUser.id}`, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));

      toast({ title: "Repost removed" });
    } else {
      openInteractionSheet('repost');
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openInteractionSheet('share');
  };

  const onRepostOnly = () => {
    setIsReposted(true);
    setRepostCount(prev => prev + 1);

    const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
    if (!reposts.includes(reel.id)) {
      reposts.push(reel.id);
      localStorage.setItem(`reposts_${currentUser.id}`, JSON.stringify(reposts));
      window.dispatchEvent(new Event('storage'));
    }

    toast({ title: "Reel reposted!" });
    setIsInteractionSheetOpen(false);
    setNavVisibility(true);
  };

  const onReplayingPost = () => {
      setIsInteractionSheetOpen(false);
      localStorage.setItem('quote_post', JSON.stringify(reel));
      router.push(`/quote`);
      setNavVisibility(true);
  }

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

  const handlePostComment = () => {
    if (!newComment.trim() && !attachedImage) return;
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      user: currentUser,
      text: newComment,
      likes: 0,
      timestamp: 'now',
      imageUrl: attachedImage || undefined,
      replies: []
    };

    let updatedComments: Comment[];

    if (replyingTo) {
        const addReply = (items: Comment[]): Comment[] => {
            return items.map(c => {
                if (c.id === replyingTo.id) {
                    return { ...c, replies: [...(c.replies || []), comment] };
                }
                if (c.replies) {
                    return { ...c, replies: addReply(c.replies) };
                }
                return c;
            });
        };
        updatedComments = addReply([...comments]);
    } else {
        updatedComments = [comment, ...comments];
    }

    setComments(updatedComments);
    localStorage.setItem(`comments_${reel.id}`, JSON.stringify(updatedComments));
    window.dispatchEvent(new Event('storage'));

    setNewComment('');
    setReplyingTo(null);
    setAttachedImage(null);
    toast({ title: replyingTo ? "Reply posted!" : "Comment posted!" });
  };

  const handleDeleteComment = (commentId: string) => {
    const removeComment = (items: Comment[]): Comment[] => {
        return items
            .filter(c => c.id !== commentId)
            .map(c => ({ ...c, replies: c.replies ? removeComment(c.replies) : undefined }));
    };
    const updatedComments = removeComment([...comments]);
    setComments(updatedComments);
    localStorage.setItem(`comments_${reel.id}`, JSON.stringify(updatedComments));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => router.push(`/profile/${reel.user.id}`),
    trackMouse: true
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(shareSearchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(shareSearchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full h-full bg-black flex flex-col overflow-hidden">
        <div {...swipeHandlers} className="absolute inset-0 z-0" onClick={togglePlay}>
            <video 
              ref={videoRef} 
              src={reel.videoUrl} 
              loop 
              autoPlay 
              playsInline 
              muted={isGloballyMuted} 
              className="w-full h-full object-contain" 
            />
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-8 h-8 text-white fill-white ml-1 opacity-80" />
                    </div>
                </div>
            )}
        </div>

        <div className="relative z-30 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div />
            <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setGlobalMute(!isGloballyMuted); }} 
                  className="text-white hover:bg-white/10 rounded-full h-10 w-10 flex items-center justify-center transition-colors outline-none"
                >
                    {isGloballyMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-white hover:bg-white/10 rounded-full h-10 w-10 flex items-center justify-center transition-colors">
                      <MoreVertical className="h-6 w-6" />
                    </button>
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
                      <DropdownMenuItem className="rounded-xl focus:bg-accent transition-all duration-200 cursor-pointer py-2.5 px-3" onClick={() => { router.back(); toast({ title: "Reel hidden" }); }}>
                          <EyeOff className="h-4 w-4 mr-3" />
                          <span className="font-bold text-sm">Hide this post</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <div className="mt-auto relative z-20 px-1.5 py-2.5 space-y-1.5 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="flex items-center justify-between px-1.5">
                <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9 border border-white/20">
                        <AvatarImage src={reel.user.avatar.imageUrl} alt={reel.user.name} />
                        <AvatarFallback>{reel.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                        <p className="text-white font-bold text-xs leading-tight">{reel.user.name}</p>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-tight">@{reel.user.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {!reel.user.id.includes(currentUser.id) && (
                        <button 
                          className={cn(
                            "h-7 w-7 rounded-full transition-all shadow-sm border flex items-center justify-center", 
                            isLinked ? "text-primary bg-primary/10 border-primary/20" : "text-white/90 border-white/20 hover:bg-white/10 border-white/50"
                          )} 
                          onClick={handleConnect}
                        >
                            <LinkIcon className="h-3 w-3" />
                        </button>
                    )}
                    {reel.user.id !== currentUser.id && (
                      <Button variant="ghost" size="icon" onClick={(e) => handleFollowToggle(reel.user.id)} className={cn("h-7 w-7 rounded-full border-2 transition-all shadow-lg backdrop-blur-sm", isFollowed ? "bg-white text-black border-white" : "text-white/90 border-white/50 hover:bg-white/10")}>
                        {isFollowed ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                </div>
            </div>

            <div className="px-1.5">
                <Progress value={progress} className="h-1 bg-white/20" />
            </div>

            <div className="flex items-center justify-between bg-black/20 backdrop-blur-md p-0.5 rounded-full w-full gap-0">
                <Button variant="ghost" className="h-7 px-1 rounded-full flex items-center justify-center gap-1 flex-1 transition-none hover:bg-transparent">
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                    <span className="text-[8px] font-bold text-white">{formatNumber(reel.views)}</span>
                </Button>
                <Button variant="ghost" className={cn("h-7 px-1 rounded-full flex items-center justify-center gap-1 flex-1 transition-none hover:bg-transparent", isLiked && "text-primary")} onClick={handleLikeClick}>
                    <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-primary")} />
                    <span className="text-[8px] font-bold text-white">{formatNumber(reel.likes + (isLiked ? 1 : 0))}</span>
                </Button>
                <Button variant="ghost" className="h-7 px-1 rounded-full flex items-center justify-center gap-1 flex-1 transition-none hover:bg-transparent" onClick={(e) => { e.stopPropagation(); openInteractionSheet('comments'); }}>
                    <MessageCircle className="h-3.5 w-3.5 text-white" />
                    <span className="text-[8px] font-bold text-white">{formatNumber(comments.length)}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn("h-7 px-1 rounded-full flex items-center justify-center gap-1 flex-1 transition-none hover:bg-transparent", (isReposted || (activeSheetView === 'repost' && isInteractionSheetOpen)) && "text-primary")} 
                  onClick={handleRepostClick}
                >
                    <Repeat className="h-3.5 w-3.5 text-white" />
                    <span className="text-[8px] font-bold text-white">{formatNumber(repostCount)}</span>
                </Button>
                <Button variant="ghost" className="h-7 px-1 rounded-full flex items-center justify-center flex-1 transition-none hover:bg-transparent" onClick={handleShareClick}>
                    <Forward className="h-3.5 w-3.5 text-white" />
                </Button>
                <Button variant="ghost" className={cn("h-7 px-1 rounded-full flex items-center justify-center flex-1 transition-none hover:bg-transparent", isBookmarked && "text-primary")} onClick={handleBookmark}>
                    <Bookmark className="h-3.5 w-3.5 text-white" />
                </Button>
            </div>
        </div>

        <Sheet open={isInteractionSheetOpen} onOpenChange={(open) => { setIsInteractionSheetOpen(open); setNavVisibility(!open); }}>
            <SheetContent side="bottom" className={cn("rounded-t-3xl p-0 flex flex-col bg-background border-none shadow-2xl overflow-hidden fixed z-[70] bottom-0", activeSheetView === 'share' ? "h-[50vh]" : activeSheetView === 'repost' ? "h-[32vh]" : "h-[85%] rounded-t-[2.5rem]")}>
                <VisuallyHidden><SheetTitle>Interactions</SheetTitle></VisuallyHidden>
                
                {activeSheetView === 'share' ? (
                    <div className="flex flex-col h-full bg-black text-white">
                        <div className="mx-auto w-12 h-1 bg-white/20 rounded-full mt-3 mb-1 shrink-0" />
                        <div className="px-4 py-2 flex gap-3 items-start border-b border-white/10 shrink-0">
                            <Avatar className="h-7 w-7"><AvatarImage src={reel.user.avatar.imageUrl} /></Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-[11px] truncate">{reel.user.name}</span>
                                    <span className="text-[10px] text-white/50">@{reel.user.id}</span>
                                </div>
                                <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{reel.caption}</p>
                            </div>
                            <X className="h-3.5 w-3.5 text-white/50 cursor-pointer mt-1" onClick={() => setIsInteractionSheetOpen(false)} />
                        </div>
                        <div className="px-4 py-3 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                                <Input placeholder="Search" className="pl-10 h-8 bg-white/10 border-none rounded-2xl text-white text-xs placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/20" value={shareSearchTerm} onChange={(e) => setShareSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        
                        <ScrollArea className="w-full whitespace-nowrap shrink-0">
                            <div className="flex w-max gap-4 px-4 py-1">
                                {filteredUsers.map(user => {
                                    const isSelected = selectedUsers.has(user.id);
                                    return (
                                        <div key={user.id} className="relative group cursor-pointer shrink-0" onClick={() => toggleUserSelection(user.id)}>
                                            <Avatar className={cn(
                                                "h-10 w-10 transition-transform group-active:scale-95 border",
                                                isSelected ? "border-primary" : "border-transparent"
                                            )}>
                                                <AvatarImage src={user.avatar.imageUrl} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-black animate-in zoom-in-50 duration-200">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <ScrollBar orientation="horizontal" className="invisible" />
                        </ScrollArea>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-2 pb-4 space-y-2.5 shrink-0 z-50">
                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex w-max gap-4 pb-1">
                                    {externalApps.map((app) => (
                                        <div key={app.name} className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform shrink-0">
                                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shadow-lg", app.bg, app.color || "text-white")}>
                                                <app.icon className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-medium text-white/70">{app.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" className="invisible" />
                            </ScrollArea>
                            {selectedUsers.size > 0 && (
                              <Button className="w-full font-bold h-8 rounded-2xl bg-white text-black hover:bg-white/90 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-2 text-xs" onClick={() => { toast({ title: `Shared!` }); setIsInteractionSheetOpen(false); }}>
                                  Send {selectedUsers.size > 0 ? `to ${selectedUsers.size}` : ''}
                              </Button>
                            )}
                        </div>
                    </div>
                ) : activeSheetView === 'repost' ? (
                     <div className="flex flex-col h-full bg-background text-foreground">
                        <div className="mx-auto w-12 h-1 bg-muted rounded-full mt-3 mb-1 shrink-0" />
                        <div className="px-4 py-2 flex-1 flex flex-col justify-center max-sm mx-auto w-full">
                            <h3 className="font-bold text-xs text-center mb-3">Select Repost Type</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors border bg-card shadow-sm group active:scale-95" onClick={onRepostOnly}>
                                    <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Repeat className="h-3.5 w-3.5 text-primary" /></div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-xs">Repost</p>
                                        <p className="text-[10px] text-muted-foreground">Instantly share this to your feed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors border bg-card shadow-sm group active:scale-95" onClick={onReplayingPost}>
                                    <div className="h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><MessageCircle className="h-3.5 w-3.5 text-blue-500" /></div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-xs">Quote Post</p>
                                        <p className="text-[10px] text-muted-foreground">Give an advice</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full font-bold h-8 rounded-xl mt-3 text-[10px]" onClick={() => setIsInteractionSheetOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full bg-background text-foreground relative">
                        <div className="flex items-center justify-between px-4 h-14 bg-background border-b shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-[16px]">Comments</span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                                        <MoreVertical className="h-5 w-5 opacity-70" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl bg-background/95 z-[110]">
                                    <DropdownMenuItem className="rounded-xl font-bold py-2.5 px-3 cursor-pointer">Sort by top</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold py-2.5 px-3 cursor-pointer">Sort by newest</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <ScrollArea className="flex-1 scrollbar-hide">
                            <div className="px-6 py-4 space-y-3 border-b bg-accent/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Link href={`/profile/${reel.user.id}`} onClick={() => setIsInteractionSheetOpen(false)}>
                                            <Avatar className="h-9 w-9 border-2 border-primary/10 shrink-0">
                                                <AvatarImage src={reel.user.avatar.imageUrl} />
                                                <AvatarFallback>{reel.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex flex-col text-left">
                                            <Link href={`/profile/${reel.user.id}`} onClick={() => setIsInteractionSheetOpen(false)} className="text-[13px] font-bold hover:underline leading-none">
                                                {reel.user.name}
                                            </Link>
                                            <span className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tight">@{reel.user.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!reel.user.id.includes(currentUser.id) && (
                                            <button 
                                              className={cn(
                                                "h-7 w-7 rounded-full transition-all shadow-sm border flex items-center justify-center", 
                                                isLinked ? "text-primary bg-primary/10 border-primary/20" : "text-white/90 border-white/20 hover:bg-white/10 border-border"
                                              )} 
                                              onClick={handleConnect}
                                            >
                                                <LinkIcon className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {reel.user.id !== currentUser.id && (
                                            <Button 
                                                variant={isFollowed ? "secondary" : "outline"} 
                                                size="sm" 
                                                className="h-7 px-3 rounded-full text-[10px] font-bold" 
                                                onClick={() => handleFollowToggle(reel.user.id)}
                                            >
                                                {isFollowed ? 'Following' : 'Follow'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-[14.5px] leading-snug whitespace-pre-wrap">{reel.caption}</p>

                                <div className="flex items-center justify-between opacity-90 w-full border-y border-border/10 py-2">
                                    <div className="flex items-center justify-between w-full px-1">
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            <span className="text-[9px] font-bold">{formatNumber(reel.views)}</span>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={handleLikeClick}>
                                            <Heart className={cn("h-3.5 w-3.5 cursor-pointer", isLiked && "fill-primary text-primary")} />
                                            <span className="text-[9px] font-bold">{formatNumber(reel.likes + (isLiked ? 1 : 0))}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            <span className="text-[9px] font-bold">{formatNumber(comments.length)}</span>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={handleRepostClick}>
                                            <Repeat className={cn("h-3.5 w-3.5 cursor-pointer", isReposted && "text-primary")} />
                                            <span className="text-[9px] font-bold">{formatNumber(repostCount)}</span>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={handleShareClick}>
                                            <Forward className="h-3.5 w-3.5 cursor-pointer" />
                                        </div>
                                        <div className="flex items-center gap-1" onClick={handleBookmark}>
                                            <Bookmark className={cn("h-3.5 w-3.5 cursor-pointer", isBookmarked && "fill-primary text-primary")} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pb-4">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <CommentItem 
                                            key={comment.id} 
                                            comment={comment} 
                                            onReply={(c) => setReplyingTo(c)} 
                                            onDelete={handleDeleteComment}
                                            onFollowToggle={handleFollowToggle}
                                            isFollowed={currentUser.following.includes(comment.user.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3">
                                        <MessageCircle className="h-10 w-10 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Join the conversation</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        
                        <div className="p-2 bg-transparent shrink-0 border-t border-border/5">
                            {attachedImage && (
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2 group shadow-lg animate-in zoom-in-50 duration-200">
                                    <Image src={attachedImage} alt="Attached" fill className="object-cover" />
                                    <button 
                                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-colors"
                                        onClick={() => setAttachedImage(null)}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                            {replyingTo && (
                                <div className="flex items-center justify-between px-4 py-2 mb-2 bg-primary/5 rounded-xl animate-in slide-in-from-bottom-2 duration-300">
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Replying to @{replyingTo.user.name}</p>
                                    <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-primary transition-colors">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-3 max-w-lg mx-auto">
                                <div className="flex-1 relative flex items-center bg-muted/50 rounded-[1.5rem] px-3 h-10 group focus-within:bg-muted transition-all border border-transparent focus-within:border-primary/20">
                                    <Avatar className="h-8 w-8 mr-2 shrink-0 border-none shadow-none">
                                        <AvatarImage src={currentUser.avatar.imageUrl} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <input 
                                        placeholder={replyingTo ? `Reply to @${replyingTo.user.name}...` : "Add a comment..."} 
                                        className="flex-1 bg-transparent border-none py-1 text-sm placeholder:text-muted-foreground focus:outline-none" 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter') handlePostComment(); 
                                        }}
                                    />
                                    <div className="flex items-center gap-3 pl-2">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                        />
                                        <button 
                                            type="button"
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                            onClick={handleAttachClick}
                                        >
                                            <Paperclip className="h-3.5 w-3.5" />
                                        </button>
                                        <button 
                                            className={cn(
                                                "h-9 w-9 rounded-full transition-all flex items-center justify-center p-0 overflow-hidden",
                                                (newComment.trim() || attachedImage) ? "text-primary scale-100 opacity-100" : "text-muted-foreground/30 scale-90 opacity-50"
                                            )}
                                            onClick={handlePostComment}
                                            disabled={!newComment.trim() && !attachedImage}
                                        >
                                            <i className="fi fi-rr-arrow-circle-up text-xl leading-none flex items-center justify-center w-full h-full"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    </div>
  );
}
