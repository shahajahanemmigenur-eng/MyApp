'use client';

import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { posts as allPosts, reels as allReels, users as allUsers, currentUser } from '@/lib/data';
import type { Post, Reel } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post-card';
import { ReelCard } from '@/components/reel-card';
import { ActivityPostCard } from '@/components/activity-post-card';
import { notFound, useRouter } from 'next/navigation';

export default function UserFeedPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = React.use(params);
  const router = useRouter();
  
  const user = [...allUsers, currentUser].find(u => u.id === userId);

  if (!user) {
    notFound();
  }

  const userPosts = allPosts.filter(p => p.user.id === userId);
  const userReels = allReels.filter(r => r.user.id === userId);

  const feedItems: (Post | Reel)[] = [...userPosts, ...userReels].sort((a, b) => {
    const dateA = new Date(a.timestamp.endsWith('ago') ? Date.now() - 1000 : a.timestamp).getTime();
    const dateB = new Date(b.timestamp.endsWith('ago') ? Date.now() - 1000 : b.timestamp).getTime();
    return dateB - dateA;
  });


  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 bg-card z-10 shrink-0 border-b sticky top-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-base font-bold ml-4">{user.name}'s Feed</h1>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {feedItems.length > 0 ? (
          <div className="flex flex-col">
            {feedItems.map((item) => {
              if ('videoUrl' in item) { // This is a Reel
                  return <ReelCard key={`reel-${item.id}`} reel={item} />;
              }
              // This is a Post
              if(item.postType === 'public_pulse'){
                return <ActivityPostCard key={`post-${item.id}`} post={item} />;
              }
              return <PostCard key={`post-${item.id}`} post={item} />;
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No posts or reels from this user yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
