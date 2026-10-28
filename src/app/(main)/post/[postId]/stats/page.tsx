'use client';

import * as React from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { posts as allPosts, reels as allReels, users as allUsers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, MessageCircle, Repeat, Bookmark, TrendingUp, Forward, BarChart3 } from 'lucide-react';
import { formatNumber, shortenTimestamp } from '@/lib/utils';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VideoPlayer } from '@/components/video-player';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function StatsContent({ postId }: { postId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'views';

  const post = allPosts.find((p) => p.id === postId);
  const reel = allReels.find((r) => r.id === postId);
  const item = post || reel;

  if (!item) {
    notFound();
  }

  const isReel = 'videoUrl' in item;
  
  // Mock data for the chart
  const viewsData = [
    { day: "Mon", views: Math.floor((item.views || 100) * 0.1) },
    { day: "Tue", views: Math.floor((item.views || 100) * 0.15) },
    { day: "Wed", views: Math.floor((item.views || 100) * 0.12) },
    { day: "Thu", views: Math.floor((item.views || 100) * 0.2) },
    { day: "Fri", views: Math.floor((item.views || 100) * 0.25) },
    { day: "Sat", views: Math.floor((item.views || 100) * 0.1) },
    { day: "Sun", views: Math.floor((item.views || 100) * 0.08) },
  ];

  // Mock users for lists
  const mockLikers = allUsers.slice(0, 5);
  const mockReposters = allUsers.slice(2, 4);
  const mockSavers = allUsers.slice(1, 3);
  const mockSharers = allUsers.slice(0, 2);

  const handleTabChange = (val: string) => {
    router.replace(`/post/${postId}/stats?tab=${val}`);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b sticky top-0 bg-background z-20">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-base font-bold ml-2">Insights</h1>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 no-scrollbar">
          <div className="border-b bg-accent/5">
             <div className="p-4 flex gap-3 items-start">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={item.user.avatar.imageUrl} />
                    <AvatarFallback>{item.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                         <p className="text-sm font-bold">{item.user.name}</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-bold">{shortenTimestamp(item.timestamp)}</p>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed line-clamp-2">{item.caption}</p>
                </div>
             </div>
             
             {(isReel || (item as any).image) && (
                <div className="px-4 pb-4">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted shadow-sm">
                        {isReel ? (
                            <VideoPlayer src={(item as any).videoUrl} />
                        ) : (item as any).image && (
                            <Image
                                src={(item as any).image.imageUrl}
                                alt={(item as any).image.description}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                </div>
             )}
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full h-auto justify-start rounded-none bg-transparent p-0 border-b grid grid-cols-6 sticky top-0 bg-background z-10 shadow-sm">
                <TabsTrigger value="views" className="rounded-none py-3 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{formatNumber(item.views)}</span>
                </TabsTrigger>
                 <TabsTrigger value="likes" className="rounded-none py-3 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                    <Heart className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{formatNumber(item.likes)}</span>
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-none py-3 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{formatNumber(item.comments.length)}</span>
                </TabsTrigger>
                <TabsTrigger value="reposts" className="rounded-none py-3 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                    <Repeat className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{formatNumber((item as any).repostCount || (item as any).shares || 0)}</span>
                </TabsTrigger>
                <TabsTrigger value="shares" className="rounded-none py-3 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                    <Forward className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{formatNumber((item as any).shares || 0)}</span>
                </TabsTrigger>
                <TabsTrigger value="saves" className="rounded-none py-3 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                    <Bookmark className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{formatNumber((item as any).saveCount || 0)}</span>
                </TabsTrigger>
            </TabsList>

            <div className="p-4 min-h-[400px]">
                <TabsContent value="views" className="mt-0 space-y-6 animate-in fade-in duration-300 outline-none">
                    <div className="text-center py-4">
                        <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h2 className="text-2xl font-bold">{formatNumber(item.views)} Impressions</h2>
                        <p className="text-xs text-muted-foreground px-4 mt-1">Total times your post was seen in your universe.</p>
                    </div>
                    
                    <div className="bg-accent/10 p-4 rounded-2xl border">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Daily Performance</h3>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                          <BarChart data={viewsData}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                              dataKey="day"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tick={{ fontSize: 10, fontWeight: 700 }}
                            />
                            <YAxis hide />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                    </div>
                </TabsContent>

                <TabsContent value="likes" className="mt-0 space-y-4 animate-in fade-in duration-300 outline-none">
                     <div className="flex items-center gap-2 mb-4">
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        <h2 className="font-bold">{formatNumber(item.likes)} Likes</h2>
                     </div>
                     <UserList users={mockLikers} />
                </TabsContent>

                <TabsContent value="comments" className="mt-0 space-y-6 animate-in fade-in duration-300 outline-none">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <h2 className="font-bold">{formatNumber(item.comments.length)} Comments</h2>
                     </div>
                    <div className="space-y-6">
                        {item.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 items-start">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={comment.user.avatar.imageUrl} />
                              <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-accent/20 p-3 rounded-2xl">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold">{comment.user.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">1d</span>
                              </div>
                              <p className="text-sm mt-0.5 leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                    {item.comments.length === 0 && (
                        <p className="text-center text-muted-foreground py-12">No comments yet.</p>
                    )}
                </TabsContent>

                <TabsContent value="reposts" className="mt-0 space-y-4 animate-in fade-in duration-300 outline-none">
                    <div className="flex items-center gap-2 mb-4">
                        <Repeat className="h-4 w-4 text-purple-500" />
                        <h2 className="font-bold">{formatNumber((item as any).repostCount || (item as any).shares || 0)} Reposts</h2>
                     </div>
                     <UserList users={mockReposters} />
                </TabsContent>

                <TabsContent value="shares" className="mt-0 space-y-4 animate-in fade-in duration-300 outline-none">
                    <div className="flex items-center gap-2 mb-4">
                        <Forward className="h-4 w-4 text-green-500" />
                        <h2 className="font-bold">{formatNumber((item as any).shares || 0)} Shares</h2>
                     </div>
                     <UserList users={mockSharers} />
                </TabsContent>

                <TabsContent value="saves" className="mt-0 space-y-4 animate-in fade-in duration-300 outline-none">
                    <div className="flex items-center gap-2 mb-4">
                        <Bookmark className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <h2 className="font-bold">{formatNumber((item as any).saveCount || 0)} Saves</h2>
                     </div>
                     <UserList users={mockSavers} />
                </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </main>
    </div>
  );
}

function UserList({ users }: { users: any[] }) {
    return (
        <div className="space-y-4">
            {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl bg-card border shadow-sm">
                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user.avatar.imageUrl} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-bold leading-none">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">@{user.id}</p>
                        </div>
                    </Link>
                    <Button variant="outline" size="sm" className="h-8 px-4 text-[10px] font-bold rounded-xl border-primary text-primary hover:bg-primary/5">
                        Follow
                    </Button>
                </div>
            ))}
            {users.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No activity recorded yet.</p>
            )}
        </div>
    )
}

export default function PostStatsPage({ params, searchParams }: { params: Promise<{ postId: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { postId } = React.use(params);
  // Optional: unwrap searchParams if needed, though useSearchParams is used in StatsContent
  React.use(searchParams);

  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-full"><TrendingUp className="h-8 w-8 animate-pulse text-primary" /></div>}>
        <StatsContent postId={postId} />
    </React.Suspense>
  )
}
