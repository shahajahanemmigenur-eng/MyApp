'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Archive, 
  Heart, 
  MessageCircle,
  Bookmark,
  Music,
  ChevronRight,
  Play,
  Pause,
  Users,
  LoaderCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { posts as allPosts, reels as allReels, users as allUsers } from '@/lib/data';
import { PostCard } from '@/components/post-card';
import { ReelCard } from '@/components/reel-card';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const forYouOptions = [
  { id: 'saved', icon: Bookmark, label: 'Saved' },
  { id: 'archive', icon: Archive, label: 'Archive' },
  { id: 'likes', icon: Heart, label: 'Likes' },
  { id: 'comments', icon: MessageCircle, label: 'Comments' },
];

function ForYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'saved');
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<any[]>([]);

  useEffect(() => {
    const updateLists = () => {
      const combined = [...allPosts, ...allReels];
      const saved = combined.filter(p => localStorage.getItem(`saved_${p.id}`) === 'true');
      const liked = combined.filter(p => localStorage.getItem(`liked_${p.id}`) === 'true');
      setSavedItems(saved);
      setLikedItems(liked);
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

  // Mock archived accounts for demo
  const archivedAccounts = allUsers.slice(0, 3);

  // Mock saved audios
  const savedSongs = [
    { title: 'Starlight', artist: 'MUSE', id: 's1' },
    { title: 'City of Stars', artist: 'La La Land Cast', id: 's2' },
    { title: 'Paint It, Black', artist: 'The Rolling Stones', id: 's3' },
    { title: 'Run Boy Run', artist: 'Woodkid', id: 's4' },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex items-center p-3 border-b bg-card z-10 shrink-0">
        <h1 className="font-bold text-lg ml-2">For You</h1>
      </header>

      <main className="flex-1 flex flex-col min-h-0 relative">
        <Tabs defaultValue="saved" value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <div className="p-2 bg-card shrink-0">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="flex w-max gap-2 bg-transparent h-auto p-0 mb-1 border-none">
                {forYouOptions.map((option) => (
                  <TabsTrigger
                    key={option.id}
                    value={option.id}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-card transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none h-8 shadow-none border-none",
                        "hover:bg-accent outline-none"
                    )}
                  >
                    <option.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-bold text-[10px] uppercase tracking-tight whitespace-nowrap">{option.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar bg-accent/5 relative min-h-0">
            <TabsContent value="archive" className="m-0 focus-visible:ring-0 outline-none">
              <div className="flex flex-col">
                <div className="p-4 bg-card">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Archived Accounts</h3>
                    <div className="space-y-4">
                        {archivedAccounts.length > 0 ? (
                            archivedAccounts.map(user => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.avatar.imageUrl} alt={user.name} />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold">{user.name}</p>
                                            <p className="text-[10px] text-muted-foreground">@{user.id}</p>
                                        </div>
                                    </Link>
                                    <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-bold rounded-full">
                                        Unarchive
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground font-medium">
                                <Users className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                <p>No archived accounts.</p>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="saved" className="m-0 focus-visible:ring-0 outline-none">
               <div className="flex flex-col">
                <div className="p-4 bg-card border-b mb-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saved Audio</h3>
                        <Link href="/saved?tab=audio" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                            See All <ChevronRight className="h-2.5 w-2.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {savedSongs.map(song => (
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
                                    className="h-5 w-5 rounded-full bg-accent flex items-center justify-center shrink-0 hover:bg-primary/20 transition-all active:scale-90 cursor-pointer"
                                >
                                    {playingId === song.id ? (
                                        <Pause className="h-2.5 w-2.5 text-primary fill-primary" />
                                    ) : (
                                        <Play className="h-2.5 w-2.5 text-primary fill-primary ml-0.5" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Saved Content</h3>
                </div>

                {savedItems.length > 0 ? (
                    savedItems.map(item => (
                        'videoUrl' in item 
                            ? <ReelCard key={item.id} reel={item} />
                            : <PostCard key={item.id} post={item} />
                    ))
                ) : (
                    <div className="text-center py-20 text-muted-foreground font-medium">
                        <Bookmark className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        <p>No saved items.</p>
                    </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="likes" className="m-0 focus-visible:ring-0 outline-none">
               <div className="flex flex-col">
                <div className="px-4 py-2 mt-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Liked Content</h3>
                </div>
                {likedItems.length > 0 ? (
                    likedItems.map(item => (
                        'videoUrl' in item 
                            ? <ReelCard key={item.id} reel={item} />
                            : <PostCard key={item.id} post={item} />
                    ))
                ) : (
                    <div className="text-center py-20 text-muted-foreground font-medium">
                        <Heart className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        <p>No liked content.</p>
                    </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="m-0 focus-visible:ring-0 outline-none">
                <div className="py-20 text-center text-muted-foreground font-medium">
                    <MessageCircle className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    <p>Your recent comments will appear here.</p>
                </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

export default function ForYouPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><LoaderCircle className="animate-spin text-primary" /></div>}>
      <ForYouContent />
    </Suspense>
  )
}