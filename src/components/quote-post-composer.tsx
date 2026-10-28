'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  MoreHorizontal, 
  FileText, 
  ChevronDown, 
  Image as ImageIcon, 
  Music, 
  Settings2, 
  Smile, 
  Type, 
  Gift, 
  Check,
  Plus,
  Link as LinkIcon,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser, type Post } from '@/lib/data';
import { cn, formatNumber } from '@/lib/utils';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function QuotePostComposer() {
  const router = useRouter();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [quotedPost, setQuotedPost] = useState<Post | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const postToQuote = localStorage.getItem('quote_post');
    if (postToQuote) {
      try {
        setQuotedPost(JSON.parse(postToQuote));
      } catch (e) {
        console.error("Failed to parse quoted post", e);
      }
    }
  }, []);

  const handlePost = () => {
    if (!caption.trim() || !quotedPost) return;

    // Create the new Quote Post object
    const newQuotePost: Post = {
      id: `quote-${Date.now()}`,
      user: currentUser,
      caption: caption,
      likes: 0,
      views: 0,
      comments: [],
      timestamp: 'Just now',
      quotedPost: quotedPost,
      repostCount: 0,
    };

    // Save to author's quote posts (will be shown in Reposts tab)
    const existingQuotes = JSON.parse(localStorage.getItem(`quote_posts_${currentUser.id}`) || '[]');
    localStorage.setItem(`quote_posts_${currentUser.id}`, JSON.stringify([newQuotePost, ...existingQuotes]));

    // Increment original post's repost count
    const currentCount = parseInt(localStorage.getItem(`repostCount_${quotedPost.id}`) || '0', 10);
    const originalBaseCount = quotedPost.repostCount || 0;
    const finalCount = (currentCount || originalBaseCount) + 1;
    localStorage.setItem(`repostCount_${quotedPost.id}`, String(finalCount));

    // Also mark as reposted so it shows active state in feed
    const reposts = JSON.parse(localStorage.getItem(`reposts_${currentUser.id}`) || '[]');
    if (!reposts.includes(quotedPost.id)) {
        reposts.push(quotedPost.id);
        localStorage.setItem(`reposts_${currentUser.id}`, JSON.stringify(reposts));
    }

    toast({
      title: "Quote Posted",
      description: "Your quote post has been shared to your universe.",
    });

    // Notify other components (like Profile) to refresh
    window.dispatchEvent(new Event('storage'));

    localStorage.removeItem('quote_post');
    router.push('/home');
  };

  const handleClose = () => {
    localStorage.removeItem('quote_post');
    router.back();
  };

  if (!quotedPost) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-foreground">
        <p className="animate-pulse font-bold text-xs uppercase tracking-widest text-muted-foreground">Initialising Quote...</p>
      </div>
    );
  }

  const quotedImages = quotedPost.images || (quotedPost.image ? [quotedPost.image] : []);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-4 h-14 border-b shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={handleClose}>
          <X className="h-6 w-6" />
        </Button>
        <h1 className="text-base font-bold tracking-tight">Quote Post</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <FileText className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Composer Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col min-h-full">
          
          {/* User Row - New Content */}
          <div className="flex gap-4 group">
            <div className="flex flex-col items-center shrink-0">
              <Avatar className="h-9 w-9 border-2 border-border shadow-xl">
                <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 flex flex-col pt-0.5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm leading-none">@{currentUser.id}</span>
              </div>

              <Textarea 
                ref={textareaRef}
                autoFocus
                placeholder="What's new?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-transparent border-none p-0 text-[16px] leading-relaxed placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-transparent min-h-[120px] resize-none shadow-none rounded-none"
              />
            </div>
          </div>

          {/* Quoted Post Card Section */}
          <div className="flex">
            <div className="w-[16px] shrink-0" />
            <div className="flex-1 pt-1 pb-4">
              <div className="border border-border rounded-xl bg-accent/5 overflow-hidden transition-all hover:bg-accent/10 shadow-md">
                <div className="flex flex-col">
                  {/* Quoted Header (Reposted from) - Reorganized to right side */}
                  <div className="p-3 border-b border-border/10 bg-accent/10 flex flex-row-reverse items-center justify-between">
                    <div className="flex flex-row-reverse items-center gap-2 text-right">
                      <Avatar className="h-7 w-7 border border-border shadow-sm shrink-0">
                        <AvatarImage src={quotedPost.user.avatar.imageUrl} />
                        <AvatarFallback>{quotedPost.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-end">
                        <span className="text-[12px] font-bold text-foreground/80 leading-none">{quotedPost.user.name}</span>
                        <div className="flex flex-row-reverse items-center gap-1.5 mt-1 justify-start">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight leading-none">Reposted</span>
                          <span className="text-[10px] text-primary font-bold leading-none">@{quotedPost.user.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full border border-border/20 bg-background/50 hover:bg-accent transition-colors shadow-sm"
                            onClick={(e) => { e.stopPropagation(); toast({ title: 'Linked!' }); }}
                        >
                            <LinkIcon className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-5 px-3 rounded-full text-[9px] font-bold border-primary/20 text-primary hover:bg-primary/5"
                            onClick={(e) => { e.stopPropagation(); toast({ title: 'Followed!' }); }}
                        >
                            Follow
                        </Button>
                    </div>
                  </div>

                  {/* Quoted Caption - MOVED UP */}
                  <div className="px-3 pt-3 pb-3 border-b border-border/10">
                    <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap text-right">{quotedPost.caption}</p>
                  </div>

                  {/* Quoted Media Content */}
                  <div className="px-3 py-3">
                    <div className="max-w-[300px] ml-auto">
                      {quotedImages.length > 0 && (
                        <div className={cn(
                          "grid gap-1.5 rounded-xl overflow-hidden mb-1 border border-border/50",
                          quotedImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          {quotedImages.slice(0, 4).map((img, i) => (
                            <div key={img.id} className={cn(
                              "relative aspect-square bg-muted",
                              quotedImages.length === 3 && i === 0 && "row-span-2 aspect-auto"
                            )}>
                              <Image src={img.imageUrl} alt="" fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {quotedPost.videoUrl && (
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-1 border border-border/50 bg-black">
                          <video src={quotedPost.videoUrl} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                              <Music className="h-5 w-5 text-white/80" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Controls */}
      <footer className="p-3 border-t border-border bg-background/90 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
          <button className="text-muted-foreground hover:text-primary transition-colors"><ImageIcon className="h-5 w-5" /></button>
          <button className="text-muted-foreground hover:text-primary transition-colors font-bold text-xs">GIF</button>
          <button className="text-muted-foreground hover:text-primary transition-colors"><Smile className="h-5 w-5" /></button>
          <button className="text-muted-foreground hover:text-primary transition-colors"><Music className="h-5 w-5" /></button>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden xs:inline-block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Public Post</span>
          <Button 
            onClick={handlePost}
            className="rounded-full px-6 h-9 text-sm font-bold shadow-xl transition-all active:scale-95"
            disabled={!caption.trim()}
          >
            Post
          </Button>
        </div>
      </footer>
    </div>
  );
}
