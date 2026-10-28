'use client';

import * as React from 'react';
import { notFound } from 'next/navigation';
import { posts as allPosts, reels as allReels } from '@/lib/data';
import { PostCard } from '@/components/post-card';
import { ReelCard } from '@/components/reel-card';
import type { Post, Reel } from '@/lib/data';
import { ActivityPostCard } from '@/components/activity-post-card';
import { useRouter } from 'next/navigation';

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = React.use(params);
  const router = useRouter();

  const post = allPosts.find((p) => p.id === postId);
  const reel = allReels.find((r) => r.id === postId);
  
  const mainItem = post || reel;

  if (!mainItem) {
    notFound();
  }

  // We are removing the 'Explore' content (otherContent) to focus on the single post
  const feedItems = [mainItem];

  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col">
          {feedItems.map((item, idx) => {
            if ('videoUrl' in item) {
                return <ReelCard key={`reel-${item.id}-${idx}`} reel={item} />;
            }
            if(item.postType === 'public_pulse'){
                return <ActivityPostCard key={`post-${item.id}-${idx}`} post={item} />;
            }
            return <PostCard key={`post-${item.id}-${idx}`} post={item} />;
          })}
        </div>
      </main>
    </div>
  );
}
