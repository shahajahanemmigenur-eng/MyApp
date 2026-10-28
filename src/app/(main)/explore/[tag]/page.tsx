'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import { TrendingUp, Sparkles } from 'lucide-react';

import { posts as allPosts, reels as allReels } from '@/lib/data';
import type { Post, Reel } from '@/lib/data';
import { ActivityPostCard } from '@/components/activity-post-card';
import { ReelCard } from '@/components/reel-card';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = React.use(params);
  const router = useRouter();
  const tag = rawTag ? decodeURIComponent(rawTag) : '';

  if (!tag) {
    notFound();
  }

  // Improved filtering to match topic names in captions and hashtags
  const filteredPosts = allPosts.filter(p => {
    const caption = p.caption.toLowerCase();
    const target = tag.toLowerCase();
    return caption.includes(`#${target.replace(/\s+/g, '')}`) || caption.includes(target);
  });

  const filteredReels = allReels.filter(r => {
    const caption = r.caption.toLowerCase();
    const target = tag.toLowerCase();
    return caption.includes(`#${target.replace(/\s+/g, '')}`) || caption.includes(target);
  });

  const hasResults = filteredPosts.length > 0 || filteredReels.length > 0;

  const { toast } = useToast();
  useEffect(() => {
    if (!hasResults) {
      toast({
        title: `No results for "${tag}"`,
        description: "Showing trending content from other niches instead.",
      });
    }
  }, [hasResults, tag, toast]);

  const postsToShow = hasResults ? filteredPosts : [...allPosts].sort((a, b) => b.views - a.views).slice(0, 5);
  const reelsToShow = hasResults ? filteredReels : [...allReels].sort((a, b) => b.views - a.views).slice(0, 3);

  const feedItems: (Post | Reel)[] = [...postsToShow, ...reelsToShow].sort((a, b) => {
    // Sort by "freshness" (timestamp) then "popularity" (views)
    const timeA = new Date(a.timestamp.includes('ago') ? Date.now() : a.timestamp).getTime();
    const timeB = new Date(b.timestamp.includes('ago') ? Date.now() : b.timestamp).getTime();
    return timeB - timeA || b.views - a.views;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {!hasResults && (
            <div className="p-6 bg-primary/5 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-xs font-bold text-primary uppercase tracking-wide">Suggested for you in {tag}</p>
            </div>
        )}
        
        {feedItems.length > 0 ? (
          <div className="flex flex-col">
            {feedItems.map((item, idx) => {
              const isReel = 'videoUrl' in item;
              if (isReel) {
                  return <ReelCard key={`reel-${item.id}-${idx}`} reel={item as Reel} />;
              }
              return <ActivityPostCard key={`post-${item.id}-${idx}`} post={item as Post} />;
          })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10 text-center">
            <TrendingUp className="h-10 w-10 opacity-20 mb-4" />
            <p className="font-bold text-foreground">Universe is expanding...</p>
            <p className="text-xs mt-1">No content found for "{tag}" yet. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}
