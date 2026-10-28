
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Hash, 
  Play, 
  Heart, 
  Search,
  Flame,
  Globe,
  Sparkles,
  Trophy,
  Gamepad2,
  Tv,
  ChevronRight,
  Clapperboard,
  ChevronLeft,
  Activity,
  User as UserIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { posts as allPosts, reels as allReels, pulseTopics, users as allUsers, currentUser } from '@/lib/data'
import type { Post, Reel } from '@/lib/data'
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { VideoPlayer } from '@/components/video-player'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const topics = [
    "Trending",
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

const trendingCategories = [
    { name: 'Breaking News', icon: Globe, color: 'text-blue-500' },
    { name: 'Sports', icon: Trophy, color: 'text-orange-500' },
    { name: 'Entertainment', icon: Tv, color: 'text-purple-500' },
    { name: 'Gaming', icon: Gamepad2, color: 'text-emerald-500' },
]

const trends = [
    { tag: 'SpaceX', count: '1.2M', category: 'Science' },
    { tag: 'Olympics2024', count: '850k', category: 'Sports' },
    { tag: 'React19', count: '240k', category: 'Technology' },
    { tag: 'SummerVibes', count: '2.1M', category: 'Lifestyle' },
    { tag: 'AIRevolution', count: '500k', category: 'Innovation' },
]

export default function TrendingPage() {
    const router = useRouter();
    const [searchValue, setSearchValue] = React.useState('');
    const [selectedTopic, setSelectedTopic] = React.useState<string | null>(null);

    const filteredTrends = React.useMemo(() => {
        if (!selectedTopic || selectedTopic === 'Trending') return trends;
        return trends.filter(t => t.category.toLowerCase() === selectedTopic.toLowerCase());
    }, [selectedTopic]);

    const filteredUsers = React.useMemo(() => {
        if (!searchValue.trim()) return [];
        const allAppUsers = [currentUser, ...allUsers];
        return allAppUsers.filter(user =>
            user.id.toLowerCase().includes(searchValue.toLowerCase()) ||
            user.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [searchValue]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchValue.trim()) {
            router.push(`/search/results?q=${encodeURIComponent(searchValue)}`);
        }
    };

    return (
        <div className="flex flex-col bg-background flex-1">
            <header className="sticky top-0 z-20 bg-card border-b">
                <div className="p-3 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users by ID..." 
                            className="pl-9 h-10 rounded-full bg-accent/50 border border-border focus-visible:ring-1 focus-visible:ring-primary"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                </div>
                {searchValue.trim() === '' && (
                    <ScrollArea className="w-full whitespace-nowrap pb-3">
                        <div className="flex w-max space-x-2 px-3">
                            {topics.map(topic => (
                                <Badge 
                                    key={topic}
                                    variant="outline"
                                    className={cn(
                                    "cursor-pointer rounded-[8px] px-3 py-1 transition-all border-2 text-xs font-bold",
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
                )}
            </header>

            <div className="flex-1 bg-background">
                {searchValue.trim() !== '' ? (
                    <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="px-4 py-3 border-b bg-muted/20">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Matching Accounts</h2>
                        </div>
                        <div className="p-2 space-y-1">
                            {filteredUsers.map(user => (
                                <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-colors group">
                                    <Avatar className="h-12 w-12 border shadow-sm">
                                        <AvatarImage src={user.avatar.imageUrl} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm leading-tight truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">@{user.id}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="py-20 text-center text-muted-foreground">
                                    <UserIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No accounts found for "{searchValue}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 pb-2">
                        <section className="w-full">
                            <div className="relative aspect-video w-full overflow-hidden bg-muted shadow-sm group active:scale-[0.98] transition-all">
                                <Image 
                                    src="https://picsum.photos/seed/ad1/800/450" 
                                    alt="Sponsored Content" 
                                    fill 
                                    className="object-cover"
                                    data-ai-hint="future technology"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <p className="text-white font-bold text-lg leading-tight">Discover New Universes</p>
                                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Explore curated content</p>
                                </div>
                            </div>
                        </section>

                        <section className="px-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 rounded-lg bg-primary/10">
                                    <Flame className="h-4 w-4 text-primary animate-pulse" />
                                </div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Trends</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {trendingCategories.map((cat) => (
                                    <div 
                                        key={cat.name} 
                                        className="flex items-center gap-2 p-2 rounded-xl bg-accent/30 border border-transparent hover:border-primary/20 hover:bg-accent/50 transition-all cursor-pointer group"
                                        onClick={() => setSelectedTopic(cat.name === 'Breaking News' ? 'News' : cat.name)}
                                    >
                                        <div className={cn("p-1.5 rounded-lg bg-card shadow-sm group-hover:scale-110 transition-transform", cat.color)}>
                                            <cat.icon className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-[11px] font-bold">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="px-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 rounded-lg bg-primary/10">
                                    <Activity className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trending Topics</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {pulseTopics.slice(0, 5).map((topic) => {
                                    const topicTag = topic.title.replace(/^[^\s]+\s+/, '');
                                    return (
                                        <Link 
                                            key={topic.title} 
                                            href={`/explore/${encodeURIComponent(topicTag)}`}
                                            className="p-2 rounded-xl bg-accent/30 border border-transparent hover:border-primary/20 hover:bg-accent/50 transition-all group"
                                        >
                                            <span className="text-[11px] font-bold truncate group-hover:text-primary transition-colors">{topic.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="px-4 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Trending Tags</h3>
                            <div className="flex flex-col gap-1">
                                {filteredTrends.map((item, idx) => (
                                    <Link href={`/explore/${item.tag}`} key={item.tag} className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}</span>
                                            <div>
                                                <p className="font-bold text-sm">#{item.tag}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5">
                                            <TrendingUp className="h-3 w-3 text-primary" />
                                            <span className="text-[10px] font-bold text-primary">{item.count}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
