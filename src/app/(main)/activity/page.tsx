'use client';

import { ActivityPostCard } from '@/components/activity-post-card';
import { ReelCard } from '@/components/reel-card';
import { posts as allPosts, reels as allReels } from '@/lib/data';

export default function ActivityPage() {
  // Filtering for all topics Public Pulse content: 
  // 1. Posts with postType === 'public_pulse'
  // 2. All Reels (as they are inherently trending/pulse content)
  const feedItems = [
    ...allPosts.filter(p => p.postType === 'public_pulse'),
    ...allReels
  ].sort((a, b) => (b.views || 0) - (a.views || 0));

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        {feedItems.map((item, idx) => {
          // Identify Reels vs Posts for appropriate rendering
          // Reels in our data don't have postType but have videoUrl
          const isReel = 'videoUrl' in item && !('postType' in item);
          
          if (isReel) {
              return <ReelCard key={`reel-${item.id}-${idx}`} reel={item as any} />;
          }
          return <ActivityPostCard key={`post-${item.id}-${idx}`} post={item as any} />;
        })}
        {feedItems.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-bold">No trending activity yet</p>
            <p className="text-xs mt-1">Trending Public Pulse content from across the universe will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
