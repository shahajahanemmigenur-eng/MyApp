
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Music, Clapperboard, LayoutGrid, Play, Pause } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { posts as allPosts, reels as allReels } from '@/lib/data';
import { PostCard } from '@/components/post-card';
import { ReelCard } from '@/components/reel-card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, Suspense } from 'react';

function SavedContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'posts';
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [savedReels, setSavedReels] = useState<any[]>([]);

  useEffect(() => {
    const updateLists = () => {
        const posts = allPosts.filter(p => localStorage.getItem(`saved_${p.id}`) === 'true');
        setSavedPosts(posts);
        const reels = allReels.filter(r => localStorage.getItem(`saved_${r.id}`) === 'true');
        setSavedReels(reels);
    };

    updateLists();
    window.addEventListener('storage', updateLists);
    return () => window.removeEventListener('storage', updateLists);
  }, []);

  const handlePlay = (e: React.MouseEvent, song: any) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowPlaying = playingId !== song.id;
    setPlayingId(isNowPlaying ? song.id : null);
    toast({
        title: isNowPlaying ? `Now playing: ${song.title}` : `Paused: ${song.title}`,
    });
  };

  const savedSongs = [
    { title: 'Starlight', artist: 'MUSE', id: 's1' },
    { title: 'City of Stars', artist: 'La La Land Cast', id: 's2' },
    { title: 'Paint It, Black', artist: 'The Rolling Stones', id: 's3' },
    { title: 'Run Boy Run', artist: 'Woodkid', id: 's4' },
    { title: 'Island in the Sun', artist: 'Weezer', id: 's5' },
  ];

  const handleTabChange = (value: string) => {
    router.push(`/saved?tab=${value}`);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar min-h-0 flex flex-col">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 h-auto p-0 bg-transparent rounded-none border-b sticky top-0 bg-background z-10 shrink-0">
            <TabsTrigger 
              value="posts" 
              className="rounded-none py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="reels" 
              className="rounded-none py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <Clapperboard className="h-4 w-4 mr-2" />
              Reels
            </TabsTrigger>
            <TabsTrigger 
              value="audio" 
              className="rounded-none py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <Music className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
            <TabsContent value="posts" className="mt-0">
                <div className="flex flex-col">
                {savedPosts.length > 0 ? (
                    savedPosts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <div className="text-center py-20 text-muted-foreground font-medium">
                    <p>No saved posts yet.</p>
                    </div>
                )}
                </div>
            </TabsContent>

            <TabsContent value="reels" className="mt-0">
                <div className="flex flex-col">
                {savedReels.length > 0 ? (
                    savedReels.map(reel => <ReelCard key={reel.id} reel={reel} />)
                ) : (
                    <div className="text-center py-20 text-muted-foreground font-medium">
                    <p>No saved reels yet.</p>
                    </div>
                )}
                </div>
            </TabsContent>

            <TabsContent value="audio" className="mt-0">
                <div className="p-4 space-y-2">
                {savedSongs.length > 0 ? (
                    savedSongs.map(song => (
                    <div 
                        key={song.id} 
                        className="flex items-center gap-2 p-2 rounded-xl border bg-card hover:bg-accent transition-colors cursor-default"
                    >
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Music className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-[10px] truncate leading-tight">{song.title}</p>
                        <p className="text-[8px] text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        <div 
                        onClick={(e) => handlePlay(e, song)}
                        className="h-6 w-6 rounded-full bg-accent flex items-center justify-center shrink-0 hover:bg-primary/20 transition-all active:scale-90 cursor-pointer"
                        >
                        {playingId === song.id ? (
                            <Pause className="h-2.5 w-2.5 text-primary fill-primary animate-in fade-in zoom-in duration-200" />
                        ) : (
                            <Play className="h-2.5 w-2.5 text-primary fill-primary ml-0.5 animate-in fade-in zoom-in duration-200" />
                        )}
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-muted-foreground font-medium">
                    <p>No saved audio yet.</p>
                    </div>
                )}
                </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

export default function SavedPage() {
  return (
    <Suspense fallback={null}>
      <SavedContent />
    </Suspense>
  );
}
