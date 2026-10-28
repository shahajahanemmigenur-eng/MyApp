'use client';

import React from 'react';
import { 
  Wand2, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Heart, 
  Sparkles,
  BarChart3,
  Play,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser, posts as allPosts, reels as allReels } from '@/lib/data';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function MonetizationPage() {
  const userPosts = allPosts.filter(p => p.user.id === currentUser.id);
  const userReels = allReels.filter(r => r.user.id === currentUser.id);
  const allContent = [...userPosts, ...userReels].sort((a, b) => b.views - a.views);

  const totalViews = allContent.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikes = allContent.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  
  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {/* Wallet Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">Estimated Balance</span>
                </div>
                <Badge variant="outline" className="border-white/30 text-white text-[10px] font-bold">PAID MONTHLY</Badge>
            </div>
            
            <div className="space-y-1 mb-6">
                <h2 className="text-4xl font-bold tracking-tight">$2,481.50</h2>
                <div className="flex items-center gap-1 text-green-300 text-xs font-bold">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>+14.2% from last month</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                    <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Weekly Views</p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">+{formatNumber(totalViews / 10)}</span>
                        <TrendingUp className="h-3 w-3 text-green-300" />
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase opacity-50 mb-1">New Followers</p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">842</span>
                        <Users className="h-3 w-3 text-blue-200" />
                    </div>
                </div>
            </div>
        </section>

        {/* Analytics Summary */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Insights Summary</h2>
            <Button variant="link" className="text-xs h-auto p-0 font-bold" asChild>
                <Link href="#">Full Analytics</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none bg-accent/30 shadow-none">
              <CardContent className="p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Views</p>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold">{formatNumber(totalViews)}</p>
                    <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <BarChart3 className="h-3 w-3 text-blue-500" />
                    </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-accent/30 shadow-none">
              <CardContent className="p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Engagement</p>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold">{formatNumber(totalLikes)}</p>
                    <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Heart className="h-3 w-3 text-red-500" />
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Creative AI Tools */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Creator Tools</h2>
          <div className="grid gap-3">
            <Card className="border shadow-sm overflow-hidden bg-card">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Wand2 className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-bold">Smart Hashtags</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-bold h-5 px-1.5">OPTIMIZED</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                        Boost discoverability and reach with AI-suggested trending hashtags.
                    </p>
                    <Button size="sm" className="w-full h-9 rounded-xl text-xs font-bold shadow-md shadow-primary/20" asChild>
                        <Link href="/create">Use Smart Suggest</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="border shadow-sm overflow-hidden bg-card opacity-80">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-orange-500" />
                        </div>
                        <CardTitle className="text-sm font-bold">Viral Scripts</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-bold h-5 px-1.5">COMING SOON</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Get personalized content hooks based on current global trends.
                    </p>
                </CardContent>
            </Card>
          </div>
        </section>

        {/* Top Content */}
        <section className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">High Performing Content</h2>
            <Button variant="ghost" className="text-[10px] h-auto p-0 font-bold uppercase tracking-tighter" asChild>
                <Link href={`/profile/${currentUser.id}/feed`}>View All</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {allContent.slice(0, 3).map((item, index) => (
              <Link key={item.id} href={`/post/${item.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-2xl border bg-card hover:bg-accent/30 transition-all group">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-muted">
                        {'image' in item ? (
                             <Image src={item.image.imageUrl} alt="" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black">
                                <Play className="h-5 w-5 text-white/50" />
                            </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 rounded-md px-1 py-0.5 text-[8px] font-bold text-white">#{index + 1}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{item.caption}</p>
                        <div className="flex items-center gap-4 mt-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                <span>{formatNumber(item.views)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                <Heart className="h-3 w-3" />
                                <span>{formatNumber(item.likes)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                <MessageCircle className="h-3 w-3" />
                                <span>{formatNumber(item.comments.length)}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}