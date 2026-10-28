
'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import { posts as allPosts, reels as allReels, currentUser, users } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Repeat, 
  MoreVertical, 
  Bell, 
  X,
  TrendingUp,
  BellOff,
  UserX,
  EyeOff,
  Bookmark,
  Paperclip,
  Forward,
  Link as LinkIcon,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, useRef, Suspense } from 'react';
import { formatNumber, shortenTimestamp } from '@/lib/utils';
import Image from 'next/image';
import { VideoPlayer } from '@/components/video-player';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"

interface CommentItemProps {
    comment: any;
    onReply: (comment: any) => void;
    level?: number;
    onDelete?: (id: string) => void;
    onFollowToggle: (userId: string) => void;
    isFollowed: boolean;
    parentComment?: any;
}

function CommentItem({ comment, onReply, level = 0, onDelete, onFollowToggle, isFollowed, parentComment }: CommentItemProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isReposted, setIsReposted] = useState(false);
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
    const hasReplies = comment.replies && comment.replies.length > 0;

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
                            <AvatarImage src={comment.user.avatar.imageUrl} alt={comment.user.name} />
                            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                            "flex flex-col",
                            !isReply ? "items-end text-right" : "items-start text-left"
                        )}>
                            <span className="text-[13px] font-bold truncate">{comment.user.name}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                {shortenTimestamp(comment.timestamp || 'now')}
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
                    {comment.text && <p className="text-[14.5px] leading-snug opacity-90 whitespace-pre-wrap">{comment.text}</p>}
                    
                    {comment.imageUrl && (
                        <div className="relative aspect-square w-full max-w-[280px] rounded-xl overflow-hidden mt-1 bg-muted shadow-sm">
                            <Image src={comment.imageUrl} alt="Attached content" fill className="object-cover" />
                        </div>
                    )}

                    {parentComment && (
                        <div className={cn(
                            "mt-1 p-1.5 rounded-lg bg-accent/10 border-primary text-[11px] text-muted-foreground max-w-full animate-in fade-in slide-in-from-top-1",
                            isReply ? "border-l-2 text-left" : "border-r-2 text-right"
                        )}>
                            <p className="font-bold uppercase tracking-tighter text-[9px] mb-0.5 opacity-70">Replying to @{parentComment.user.id}</p>
                            <p className="line-clamp-1 italic opacity-80">"{parentComment.text}"</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center pt-1 border-t border-border/10 w-full">
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
                        "mt-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 px-1",
                        isReply ? "pl-2" : "pr-2 flex-row-reverse"
                    )}
                >
                    <div className="w-4 h-[1px] bg-muted-foreground/30" />
                    {showReplies ? "Hide replies" : `View ${comment.replies.length} replies`}
                </button>
            )}

            {showReplies && hasReplies && (
                <div className="w-full mt-1">
                    {comment.replies.map((reply: any) => (
                        <CommentItem 
                            key={reply.id}
                            comment={reply}
                            level={level + 1}
                            onReply={onReply}
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

function PostCommentsContent({ postId }: { postId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const post = allPosts.find((p) => p.id === postId);
  const reel = allReels.find((r) => r.id === postId);
  const item = post || reel;

  if (!item) {
    notFound();
  }

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<any | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [repostCount, setRepostCount] = useState(item.repostCount || (item as any).shares || 0);
  const [isReposted, setIsReposted] = useState(false);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateDynamicContent = () => {
      const savedComments = localStorage.getItem(`comments_${postId}`);
      if (savedComments) {
        try {
          setComments(JSON.parse(savedComments));
        } catch (e) {
          console.error(`Failed to parse comments for post ${postId}:`, e);
          setComments(item.comments);
        }
      } else {
        setComments(item.comments);
      }

      const saved = localStorage.getItem(`saved_${postId}`);
      setIsBookmarked(saved === 'true');
      const liked = localStorage.getItem(`liked_${postId}`);
      setIsLiked(liked === 'true');
      try {
        const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
        setIsReposted(reposts.includes(postId));
      } catch (e) {
        console.error(`Failed to parse reposts for ${currentUser.id}:`, e);
        setIsReposted(false);
      }
    };

    updateDynamicContent();
    window.addEventListener('storage', updateDynamicContent);
    return () => window.removeEventListener('storage', updateDynamicContent);
  }, [postId, item.comments]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handlePostComment = () => {
    if (!newComment.trim() && !attachedImage) return;
    const comment = {
      id: `c${Date.now()}`,
      user: currentUser,
      text: newComment,
      likes: 0,
      timestamp: 'now',
      imageUrl: attachedImage || undefined,
      parentId: replyingToComment ? replyingToComment.id : undefined,
      replies: []
    };
    
    let updatedComments: any[];
    if (replyingToComment) {
        const insertReply = (list: any[]): any[] => {
            return list.map(c => {
                if (c.id === replyingToComment.id) {
                    return { ...c, replies: [...(c.replies || []), comment] };
                }
                if (c.replies) return { ...c, replies: insertReply(c.replies) };
                return c;
            });
        }
        updatedComments = insertReply([...comments]);
    } else {
        updatedComments = [comment, ...comments];
    }
    
    setComments(updatedComments);
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments));
    window.dispatchEvent(new Event('storage'));

    setNewComment('');
    setReplyingToComment(null);
    setAttachedImage(null);
    toast({ title: replyingToComment ? "Reply posted!" : "Comment posted!" });
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

  const isReel = 'videoUrl' in item;
  const images = (item as any).images || ((item as any).image ? [(item as any).image!] : []);

  return (
    <div className="flex flex-col h-full bg-background text-foreground relative overflow-hidden">
      <header className="flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-md sticky top-0 z-50 shrink-0 border-b">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3 text-left">
                <Avatar className="h-9 w-9 border">
                    <AvatarImage src={item.user.avatar.imageUrl} alt={item.user.name} />
                </Avatar>
                <div className="flex flex-col leading-tight">
                    <h1 className="text-sm font-bold tracking-tight leading-none">{item.user.id}</h1>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase mt-1 tracking-wider">{formatNumber(item.views)} views</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10">
                <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl bg-background/95">
                    <DropdownMenuItem className="rounded-xl focus:bg-accent transition-all duration-200 cursor-pointer py-2.5 px-3" onClick={() => toast({ title: "Feedback received" })}>
                        <EyeOff className="h-4 w-4 mr-3" />
                        <span className="font-bold text-sm">Not interested</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl focus:bg-accent transition-all duration-200 cursor-pointer py-2.5 px-3">
                        <BellOff className="h-4 w-4 mr-3" />
                        <span className="font-bold text-sm">Mute post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl focus:bg-destructive/10 focus:text-destructive transition-all duration-200 cursor-pointer py-2.5 px-3">
                        <UserX className="h-4 w-4 mr-3" />
                        <span className="font-bold text-sm">Block account</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <ScrollArea className="flex-1 scrollbar-hide">
          <div className="flex flex-col">
              <div className="p-4 bg-muted/5 px-4">
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{item.caption}</p>
              </div>

              {(item as any).quotedPost && (
                <div className="px-4 pb-4">
                    <div className="border rounded-2xl overflow-hidden bg-accent/5 transition-all group shadow-sm">
                        <div className="p-3 border-b border-border/5 bg-accent/10 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full border border-border/20 bg-background/50 shadow-sm" onClick={(e) => { e.stopPropagation(); toast({ title: 'Linked!' }); }}>
                                    <LinkIcon className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-5 px-2 rounded-[4px] text-[9px] font-bold border-primary/20 text-primary">Follow</Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col text-right">
                                    <span className="font-bold text-[10px] leading-none">{(item as any).quotedPost.user.name}</span>
                                    <span className="text-[9px] text-muted-foreground">@{(item as any).quotedPost.user.id}</span>
                                </div>
                                <Avatar className="h-6 w-6 border">
                                    <AvatarImage src={(item as any).quotedPost.user.avatar.imageUrl} />
                                </Avatar>
                            </div>
                        </div>
                        <div className="p-3 text-right pr-2">
                           <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{(item as any).quotedPost.caption}</p>
                        </div>
                        {((item as any).quotedPost.image || (item as any).quotedPost.videoUrl || ((item as any).quotedPost.images && (item as any).quotedPost.images.length > 0)) && (
                          <div className="relative aspect-video bg-black/20">
                            {(item as any).quotedPost.videoUrl ? (
                              <VideoPlayer src={(item as any).quotedPost.videoUrl} />
                            ) : ((item as any).quotedPost.image || ((item as any).quotedPost.images && (item as any).quotedPost.images.length > 0)) && (
                              <Image 
                                src={(item as any).quotedPost.image?.imageUrl || (item as any).quotedPost.images![0].imageUrl} 
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

              <div className="relative w-full px-4 py-2 bg-background">
                  <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-sm">
                    {isReel ? (
                        <VideoPlayer src={(item as any).videoUrl} className="w-full h-auto block" />
                    ) : images.length > 1 ? (
                        <Carousel setApi={setApi} className="w-full">
                            <CarouselContent>
                                {images.map((img: any, index: number) => (
                                    <CarouselItem key={img.id}>
                                        <div className="relative aspect-[4/5] w-full">
                                            <Image
                                                src={img.imageUrl}
                                                alt={img.description}
                                                fill
                                                className="object-contain"
                                                priority={index === 0}
                                                data-ai-hint={img.imageHint}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {count > 1 && (
                                <div className="absolute top-4 right-4 bg-black/50 text-white text-[11px] font-bold rounded-full px-3 py-1.5 z-10 backdrop-blur-md">
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
                                className="w-full h-auto block"
                                priority
                                data-ai-hint={images[0].imageHint}
                            />
                        </div>
                    ) : null}
                  </div>
              </div>

              <div className="px-4 py-2 flex items-center justify-between border-b bg-background">
                  <div className="flex justify-between w-full items-center px-1">
                      <button className="flex items-center gap-1 text-foreground h-7 px-1 rounded-full">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-[8px] font-bold">{formatNumber(item.views)}</span>
                      </button>
                      <button className={cn("flex items-center gap-1 transition-colors h-7 px-1 rounded-full", isLiked ? "text-red-500" : "text-foreground")} onClick={() => setIsLiked(!isLiked)}>
                          <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                          <span className="text-[8px] font-bold">{formatNumber(item.likes + (isLiked ? 1 : 0))}</span>
                      </button>
                      <button className="flex items-center gap-1 text-foreground h-7 px-1 rounded-full">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="text-[8px] font-bold">{formatNumber(comments.length)}</span>
                      </button>
                      <button className={cn("flex items-center gap-1 transition-colors h-7 px-1 rounded-full", isReposted ? "text-green-500" : "text-foreground")} onClick={() => setIsReposted(!isReposted)}>
                          <Repeat className="h-3.5 w-3.5" />
                          <span className="text-[8px] font-bold">{formatNumber(repostCount)}</span>
                      </button>
                      <button className="text-foreground transition-colors h-7 px-1 rounded-full" onClick={() => toast({ title: "Opening share options..." })}>
                          <Forward className="h-3.5 w-3.5" />
                      </button>
                      <button className={cn("transition-colors h-7 px-1 rounded-full", isBookmarked ? "text-primary" : "text-foreground")} onClick={() => setIsBookmarked(!isBookmarked)}>
                          <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-primary")} />
                      </button>
                  </div>
              </div>
          </div>

          <div className="pb-4 mt-6">
            {comments.map((comment) => (
                <CommentItem 
                    key={comment.id}
                    comment={comment} 
                    onReply={(c) => { setReplyingToComment(c); }} 
                    onDelete={(id) => {
                        const removeById = (list: any[]): any[] => {
                            return list.filter(c => c.id !== id).map(c => ({ ...c, replies: c.replies ? removeById(c.replies) : undefined }));
                        }
                        const updated = removeById(comments);
                        setComments(updated);
                        localStorage.setItem(`comments_${postId}`, JSON.stringify(updated));
                        window.dispatchEvent(new Event('storage'));
                    }}
                    onFollowToggle={handleFollowToggle}
                    isFollowed={currentUser.following.includes(comment.user.id)}
                />
            ))}
          </div>
      </ScrollArea>

      <footer className="p-2 bg-transparent shrink-0 border-t border-border/5">
        <div className="max-w-md mx-auto">
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
            {replyingToComment && (
                <div className="flex items-center justify-between px-4 py-1 mb-1 bg-primary/5 rounded-t-xl animate-in slide-in-from-bottom-2 duration-300">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Replying to @{replyingToComment.user.id}</p>
                    <button onClick={() => setReplyingToComment(null)} className="text-muted-foreground hover:text-primary transition-colors">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1 group focus-within:bg-muted transition-all border border-transparent focus-within:border-primary/20">
                <Avatar className="h-8 w-8 shrink-0 border-none shadow-none">
                    <AvatarImage src={currentUser.avatar.imageUrl} />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center gap-2">
                    <input 
                        placeholder={replyingToComment ? `Reply to ${replyingToComment.user.id}...` : `Reply to ${item.user.id}...`}
                        className="flex-1 bg-transparent border-none py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
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
                        >
                            <i className="fi fi-rr-arrow-circle-up text-xl leading-none flex items-center justify-center w-full h-full"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

export default function PostCommentsPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = React.use(params);
  return (
    <Suspense fallback={null}>
        <PostCommentsContent postId={postId} />
    </Suspense>
  );
}
