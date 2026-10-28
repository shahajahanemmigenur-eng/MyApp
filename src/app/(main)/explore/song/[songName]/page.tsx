'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clapperboard, Music, Play, Pause, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { posts as allPosts, reels as allReels } from '@/lib/data';
import type { Post, Reel } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { useToast } from '@/hooks/use-toast';

export default function SongPage({ params }: { params: Promise<{ songName: string }> }) {
  const { songName: encodedSongName } = React.use(params);
  const { toast } = useToast();
  const songName = encodedSongName ? decodeURIComponent(encodedSongName) : '';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!songName) {
    notFound();
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
        title: isPlaying ? `Paused "${songName}"` : `Now playing "${songName}"`,
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
        title: isSaved ? 'Song Unsaved' : 'Song Saved!',
    });
  };

  const filteredPosts = allPosts.filter(p => p.song === songName);
  const filteredReels = allReels.filter(r => r.song === songName);

  const feedItems: (Post | Reel)[] = [...filteredPosts, ...filteredReels].sort((a, b) => b.likes - a.likes);

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between p-3 bg-card z-10 shrink-0 border-b sticky top-0">
        <div className="flex items-center gap-2">
            <div className='flex items-center gap-2'>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-sm font-bold uppercase tracking-tight">{songName}</h1>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave}>
                <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {feedItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5">
            {feedItems.map((item) => {
              const isReel = 'videoUrl' in item;
              return isReel ? (
                <Link
                  key={`reel-${item.id}`}
                  href={`/post/${item.id}`}
                  className="relative aspect-square cursor-pointer group bg-muted"
                >
                  <VideoPlayer src={(item as Reel).videoUrl} />
                  <div className="absolute top-1.5 right-1.5 bg-black/50 p-1 rounded-full">
                    <Clapperboard className="h-3 w-3 text-white" />
                  </div>
                </Link>
              ) : (
                <Link key={`post-${item.id}`} href={`/post/${item.id}`} className="relative aspect-square cursor-pointer group bg-muted">
                  <Image
                    src={(item as Post).image?.imageUrl || ''}
                    alt={(item as Post).image?.description || ''}
                    fill
                    className="object-cover"
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-bold">
            <p>No content found for "{songName}".</p>
          </div>
        )}
      </main>
    </div>
  );
}
