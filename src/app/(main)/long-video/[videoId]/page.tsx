'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import { reels as allReels } from '@/lib/data';
import { ReelCard } from '@/components/reel-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function LongVideoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = React.use(params);
  const router = useRouter();

  const video = allReels.find((r) => r.id === videoId);
  
  if (!video) {
    notFound();
  }

  const otherUserReels = allReels
    .filter((r) => r.user.id === video.user.id && r.id !== videoId && r.duration > 45)
    .sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col h-full">
        <header className="flex items-center p-3 bg-card z-10 shrink-0 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-base font-bold ml-4">{video.user.name}'s Videos</h1>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <ReelCard reel={video} />
        <div className="flex flex-col">
          {otherUserReels.map(r => <ReelCard key={r.id} reel={r} />)}
        </div>
      </main>
    </div>
  );
}
