
"use client";

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { ReelCard } from '@/components/reel-card';
import { posts as allPosts, reels as allReels, currentUser } from '@/lib/data';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LoaderCircle } from 'lucide-react';

function HomeFeedContent() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'new';

    // Stable feeds: Only shuffled once on mount to prevent jumping content
    const combinedFeed = useMemo(() => {
        return [...allPosts, ...allReels].sort(() => Math.random() - 0.5);
    }, []);

    const followingPosts = useMemo(() => {
        return [...allPosts, ...allReels]
          .filter(item => currentUser.following.includes(item.user.id))
          .sort(() => Math.random() - 0.5);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <Tabs value={activeTab} className="w-full flex-1 flex flex-col">
                <TabsContent value="new" className="mt-0 flex-1">
                    <div className="flex flex-col">
                        {combinedFeed.map((item) => {
                            if ('videoUrl' in item) {
                                return <ReelCard key={`new-reel-${item.id}`} reel={item as any} clickable={false} />;
                            }
                            return <PostCard key={`new-post-${item.id}`} post={item as any} clickable={false} />;
                        })}
                    </div>
                </TabsContent>
                
                <TabsContent value="following" className="mt-0 flex-1">
                    <div className="flex flex-col">
                        {followingPosts.length > 0 ? (
                            followingPosts.map((item) => {
                                if ('videoUrl' in item) {
                                    return <ReelCard key={`following-reel-${item.id}`} reel={item as any} clickable={false} />;
                                }
                                return <PostCard key={`following-post-${item.id}`} post={item as any} clickable={false} />;
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <div className="p-4 rounded-full bg-accent/50 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 opacity-20"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                </div>
                                <p className="font-bold text-foreground">Your Following feed is empty</p>
                                <p className="text-xs mt-1">Start following people to see their latest posts and reels here.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export function HomeFeed() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><LoaderCircle className="animate-spin text-primary" /></div>}>
      <HomeFeedContent />
    </Suspense>
  )
}
