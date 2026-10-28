
'use client';

import type { SharedItem } from '@/lib/data';
import { PostCard } from './post-card';
import { ReelCard } from './reel-card';

export function SharedItemCard({ item }: { item: SharedItem }) {
  const isPost = 'caption' in item.content;

  return (
    <div className="overflow-hidden">
        {isPost ? (
          <PostCard post={item.content} />
        ) : (
          <ReelCard reel={item.content} />
        )}
    </div>
  );
}
