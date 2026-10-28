'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Search as SearchIcon, Clapperboard, MessageCircle } from "lucide-react"
import Link from 'next/link';
import { posts as allPosts, reels as allReels } from "@/lib/data"
import type { Post, Reel } from '@/lib/data'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image';
import { VideoPlayer } from '@/components/video-player'
import { cn } from '@/lib/utils'

const topics = [
    "Trending",
    "Public Pulse",
    "Sports",
    "Comedy",
    "News",
    "Politics",
    "Games",
    "Education",
    "Motivation",
    "Technology",
    "Art",
    "Business",
    "Culture",
    "Science",
    "Food",
    "Animal",
    "Fashion & Beauty",
    "Health & Fitness",
    "Travel",
]

export default function SearchPage() {
    const router = useRouter();
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    // Grid items are now fully stable and only update if selectedTopic changes
    const gridItems = useMemo(() => {
        let sourcePosts = [...allPosts];
        let sourceReels = [...allReels];

        if (selectedTopic && selectedTopic !== 'Trending') {
            const tag = selectedTopic.toLowerCase();
            if (selectedTopic === 'Public Pulse') {
                sourcePosts = sourcePosts.filter(p => p.postType === 'public_pulse');
                sourceReels = [];
            } else {
                sourcePosts = sourcePosts.filter(p => p.caption.toLowerCase().includes(tag));
                sourceReels = sourceReels.filter(r => r.caption.toLowerCase().includes(tag));
            }
        }

        // Sorting by views ensures stability vs random shuffle
        const longVideos = sourceReels.filter(r => r.duration > 30).sort((a, b) => b.views - a.views);
        const standardReels = sourceReels.filter(r => r.duration <= 30).sort((a, b) => b.views - a.views);
        const allPostsList = sourcePosts.sort((a, b) => b.views - a.views);

        const result: { item: Post | Reel; size: string; isReel: boolean }[] = [];
        
        for (let i = 0; i < 40; i++) {
            const getBig = () => longVideos.shift() || allPostsList.shift() || standardReels.shift();
            const getTall = () => standardReels.shift() || allPostsList.shift() || longVideos.shift();
            const getSmall = () => allPostsList.shift() || standardReels.shift() || longVideos.shift();

            const pattern = i % 4;

            if (pattern === 0) {
                const b = getBig(); if (b) result.push({ item: b, size: "col-span-2 row-span-2 aspect-square", isReel: 'videoUrl' in b });
                const s1 = getSmall(); if (s1) result.push({ item: s1, size: "aspect-square", isReel: 'videoUrl' in s1 });
                const t = getTall(); if (t) result.push({ item: t, size: "row-span-2 aspect-[1/2]", isReel: true });
                const s2 = getSmall(); if (s2) result.push({ item: s2, size: "aspect-square", isReel: 'videoUrl' in s2 });
            } else if (pattern === 1) {
                const s1 = getSmall(); if (s1) result.push({ item: s1, size: "aspect-square", isReel: 'videoUrl' in s1 });
                const t = getTall(); if (t) result.push({ item: t, size: "row-span-2 aspect-[1/2]", isReel: true });
                const b = getBig(); if (b) result.push({ item: b, size: "col-span-2 row-span-2 aspect-square", isReel: 'videoUrl' in b });
                const s2 = getSmall(); if (s2) result.push({ item: s2, size: "aspect-square", isReel: 'videoUrl' in s2 });
            } else if (pattern === 2) {
                const t = getTall(); if (t) result.push({ item: t, size: "row-span-2 aspect-[1/2]", isReel: true });
                const b = getBig(); if (b) result.push({ item: b, size: "col-span-2 row-span-2 aspect-square", isReel: 'videoUrl' in b });
                const s1 = getSmall(); if (s1) result.push({ item: s1, size: "aspect-square", isReel: 'videoUrl' in s1 });
                const s2 = getSmall(); if (s2) result.push({ item: s2, size: "aspect-square", isReel: 'videoUrl' in s2 });
            } else {
                for(let j=0; j<4; j++) {
                    const s = getSmall(); if (s) result.push({ item: s, size: "aspect-square", isReel: 'videoUrl' in s });
                }
            }
        }
        
        const leftovers = [...allPostsList, ...standardReels, ...longVideos];
        leftovers.forEach(item => {
            result.push({ item, size: "aspect-square", isReel: 'videoUrl' in item });
        });
        
        return result.filter(r => r.item !== undefined);
    }, [selectedTopic]);

    return (
        <div className="flex flex-col bg-background flex-1">
            <header className="sticky top-0 z-20 pt-3 bg-card shrink-0 border-b">
                <div 
                    className="relative w-full px-3 cursor-pointer group active:scale-[0.99] transition-transform"
                    onClick={() => router.push('/search/trending')}
                >
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex items-center pl-10 text-base text-muted-foreground bg-accent/50 rounded-full h-11 transition-colors group-hover:bg-accent/80 border border-border">
                        Search...
                    </div>
                </div>
                <ScrollArea className="w-full whitespace-nowrap mt-3 pb-3">
                    <div className="flex w-max space-x-2 px-3">
                        {topics.map(topic => (
                            <Badge 
                                key={topic}
                                variant='outline'
                                className={cn(
                                "cursor-pointer rounded-[8px] px-3 py-1 text-xs font-bold transition-all border-2",
                                selectedTopic === topic 
                                    ? "border-primary text-primary bg-transparent" 
                                    : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground/30"
                                )}
                                onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
                            >
                                {topic}
                            </Badge>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
            </header>
            <div className="flex-1 bg-accent/5">
                <div className="grid grid-cols-4 grid-flow-row-dense gap-0.5 p-0.5">
                    {gridItems.map((itemObj, idx) => {
                        const { item, size, isReel } = itemObj;
                        const post = item as Post;

                        return (
                            <Link 
                                key={`${item.id}-${idx}`} 
                                href={isReel ? `/reels?id=${item.id}` : `/post/${item.id}`} 
                                className={cn(
                                    "relative cursor-pointer group bg-muted overflow-hidden transition-opacity hover:opacity-95",
                                    size
                                )}
                            >
                                {isReel ? (
                                    <>
                                        <VideoPlayer src={(item as Reel).videoUrl} />
                                        <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full backdrop-blur-sm z-10">
                                            <Clapperboard className="h-3 w-3 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="relative w-full h-full">
                                        {post.image ? (
                                            <Image
                                                src={post.image.imageUrl}
                                                alt={post.image.description || 'Discovery Post'}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 p-2 flex flex-col justify-center items-center text-center overflow-hidden">
                                                <MessageCircle className="h-4 w-4 text-primary/40 mb-1" />
                                                <p className="text-[9px] font-bold leading-tight line-clamp-4">{post.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
