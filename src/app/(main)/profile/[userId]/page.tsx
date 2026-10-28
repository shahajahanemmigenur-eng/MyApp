'use client';

import * as React from 'react';
import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  MessageCircle, 
  ChevronLeft, 
  ExternalLink, 
  Mail, 
  Bookmark, 
  Briefcase, 
  User as UserIcon,
  UserCircle,
  Link as LinkIcon,
  Users,
  TrendingUp
} from 'lucide-react';
import { users, posts as allPosts, currentUser as loggedInUser, stories, reels as allReels } from '@/lib/data';
import type { Post, Story, Reel } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notFound, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { StoryViewer } from '@/components/story-viewer';
import { ReelCard } from '@/components/reel-card';
import { PostCard } from '@/components/post-card';
import { ActivityPostCard } from '@/components/activity-post-card';
import { Badge } from '@/components/ui/badge';
import { useSwipeable } from 'react-swipeable';

const formatNumberSafe = (num: number) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
};

function ProfilePageComponent({ userId, initialTab }: { userId: string, initialTab?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const isCurrentUser = userId === loggedInUser.id;
  const user = isCurrentUser ? loggedInUser : users.find((u) => u.id === userId);
  const [isFollowing, setIsFollowing] = useState(isCurrentUser ? false : loggedInUser.following.includes(userId));
  const [isLinked, setIsLinked] = useState(user ? loggedInUser.connections.includes(user.id) : false);
  const [connectionsCount, setConnectionsCount] = useState(user?.connections.length || 0);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [repostedIds, setRepostedIds] = useState<string[]>([]);
  const [dynamicPulsePosts, setDynamicPulsePosts] = useState<Post[]>([]);
  const [dynamicProfilePosts, setDynamicProfilePosts] = useState<Post[]>([]);
  const [dynamicQuotePosts, setDynamicQuotePosts] = useState<Post[]>([]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.userId === userId) {
        setConnectionsCount(user?.connections.length || 0);
        setIsLinked(loggedInUser.connections.includes(userId));
      }
    };
    
    const updateDynamicContent = () => {
      const storedReposts = localStorage.getItem(`reposts_${userId}`);
      if (storedReposts) {
        try {
          setRepostedIds(JSON.parse(storedReposts));
        } catch (error) {
          console.error(`Failed to parse reposts for ${userId}:`, error);
          setRepostedIds([]);
        }
      } else {
        setRepostedIds([]);
      }

      const storedPulse = localStorage.getItem(`pulse_posts_${userId}`);
      if (storedPulse) {
        try {
          setDynamicPulsePosts(JSON.parse(storedPulse));
        } catch (error) {
          console.error(`Failed to parse pulse posts for ${userId}:`, error);
          setDynamicPulsePosts([]);
        }
      } else {
        setDynamicPulsePosts([]);
      }

      const storedProfile = localStorage.getItem(`profile_posts_${userId}`);
      if (storedProfile) {
        try {
          setDynamicProfilePosts(JSON.parse(storedProfile));
        } catch (error) {
          console.error(`Failed to parse profile posts for ${userId}:`, error);
          setDynamicProfilePosts([]);
        }
      } else {
        setDynamicProfilePosts([]);
      }

      const storedQuotes = localStorage.getItem(`quote_posts_${userId}`);
      if (storedQuotes) {
        try {
          setDynamicQuotePosts(JSON.parse(storedQuotes));
        } catch (error) {
          console.error(`Failed to parse quote posts for ${userId}:`, error);
          setDynamicQuotePosts([]);
        }
      } else {
        setDynamicQuotePosts([]);
      }
    };

    updateDynamicContent();
    window.addEventListener('storage', updateDynamicContent);
    window.addEventListener('sociverse:connections-updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', updateDynamicContent);
      window.removeEventListener('sociverse:connections-updated', handleUpdate as EventListener);
    };
  }, [userId, user?.connections.length]);
  
  const userPosts = useMemo(() => {
    const staticPosts = user ? allPosts.filter((post) => post.user.id === user.id && post.postType !== 'public_pulse' && !post.quotedPost) : [];
    const combined = [...staticPosts, ...dynamicProfilePosts];
    return combined.sort((a, b) => {
        const dateA = new Date(a.timestamp === 'Just now' ? Date.now() : (a.timestamp.endsWith('ago') ? Date.now() - 1000 : a.timestamp)).getTime();
        const dateB = new Date(b.timestamp === 'Just now' ? Date.now() : (b.timestamp.endsWith('ago') ? Date.now() - 1000 : b.timestamp)).getTime();
        return dateB - dateA;
    });
  }, [user, dynamicProfilePosts]);

  const userReels = user ? allReels.filter(reel => reel.user.id === user.id) : [];
  const userTrendingReels = user ? [...userReels].sort((a, b) => b.likes - a.likes) : [];
  
  const userPublicPosts = useMemo(() => {
    const staticPulse = user ? allPosts.filter(post => post.user.id === user.id && post.postType === 'public_pulse') : [];
    const combined = [...staticPulse, ...dynamicPulsePosts];
    return combined.sort((a, b) => {
        const dateA = new Date(a.timestamp === 'Just now' ? Date.now() : (a.timestamp.endsWith('ago') ? Date.now() - 1000 : a.timestamp)).getTime();
        const dateB = new Date(b.timestamp === 'Just now' ? Date.now() : (b.timestamp.endsWith('ago') ? Date.now() - 1000 : b.timestamp)).getTime();
        return dateB - dateA;
    });
  }, [user, dynamicPulsePosts]);
  
  const userReposts = useMemo(() => {
    // 1. Static items that match reposted IDs
    const staticReposted = [...allPosts, ...allReels].filter(item => repostedIds.includes(item.id));
    
    // 2. Dynamic quote posts authored by this user
    const combined = [...staticReposted, ...dynamicQuotePosts];
    
    // Sort by timestamp
    return combined.sort((a, b) => {
        const parseTs = (ts: string) => ts === 'Just now' ? Date.now() : (ts.endsWith('ago') ? Date.now() - 1000 : new Date(ts).getTime());
        return parseTs(b.timestamp) - parseTs(a.timestamp);
    });
  }, [userId, repostedIds, dynamicQuotePosts]);

  const userStory = user ? stories.find(story => story.user.id === user.id) : null;
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleOpenStory = () => {
    if (userStory) {
      setSelectedStory(userStory);
      setIsViewerOpen(true);
    }
  };

  const handleCloseStory = () => {
      setIsViewerOpen(false);
      setSelectedStory(null);
  };

  const handleNextStory = () => handleCloseStory();
  const handlePreviousStory = () => handleCloseStory();

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isCurrentUser) return;
    
    const isCurrentlyLinked = loggedInUser.connections.includes(user.id);
    
    if (isCurrentlyLinked) {
      loggedInUser.connections = loggedInUser.connections.filter(id => id !== user.id);
      user.connections = user.connections.filter(id => id !== loggedInUser.id);
      setIsLinked(false);
      setConnectionsCount(prev => Math.max(0, prev - 1));
      toast({ title: 'Unlinked!' });
    } else {
      loggedInUser.connections.push(user.id);
      if (!user.connections.includes(loggedInUser.id)) {
          user.connections.push(loggedInUser.id);
      }
      setIsLinked(true);
      setConnectionsCount(prev => prev + 1);
      toast({ title: 'Linked!' });
    }
    
    window.dispatchEvent(new CustomEvent('sociverse:connections-updated', { 
      detail: { userId: user.id } 
    }));
  };

  const handleFollowToggle = () => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    if (newFollowingState) {
        if (!loggedInUser.following.includes(userId)) {
            loggedInUser.following.push(userId);
        }
        toast({
            title: 'User Followed',
            description: `You are now following ${user?.name}.`,
        });
    } else {
        const index = loggedInUser.following.indexOf(userId);
        if (index > -1) {
            loggedInUser.following.splice(index, 1);
        }
        toast({
            title: 'User Unfollowed',
            description: `You have unfollowed ${user?.name}.`,
        });
    }
  }

  const handleOpenMaps = () => {
    if (user?.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.location)}`, '_blank');
    }
  };

  const getDomain = (url?: string) => {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch (error) {
      console.error("Failed to parse URL domain:", error);
      return '';
    }
  };
  
  if (!user) {
    notFound();
  }
  
  const parseTimestamp = (timestamp: string): number => {
    const now = Date.now();
    if (timestamp === 'Just now') return now;
    if (timestamp.endsWith('ago')) {
      const parts = timestamp.split(' ');
      const value = parseInt(parts[0], 10);
      const unit = parts[1];
      if (unit.startsWith('hour')) return now - value * 60 * 60 * 1000;
      if (unit.startsWith('day')) return now - value * 24 * 60 * 60 * 1000;
      if (unit.startsWith('week')) return now - value * 7 * 24 * 60 * 60 * 1000;
      if (unit.startsWith('month')) return now - value * 30 * 24 * 60 * 60 * 1000;
    }
    return new Date(timestamp).getTime();
  };
  
  const allUserContent: (Post | Reel)[] = [...userPosts, ...userReels]
    .sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp))
    .slice(0, 15);


  const totalPostsAndReels = userPosts.length + userReels.length;
  const defaultTab = initialTab || 'posts';
  const showActivityTab = userPublicPosts.length > 0;
  
  const allAppUsers = [loggedInUser, ...users];
  const followerCount = allAppUsers.filter(u => u.following.includes(user.id)).length;
  
  const mutualConnections = isCurrentUser ? [] : allAppUsers.filter(u => 
    loggedInUser.connections.includes(u.id) && user.connections.includes(u.id)
  );

  const getGridCols = () => {
    let count = 3; // base: posts, reposts, trending
    if (showActivityTab) count++;
    return `grid-cols-${count}`;
  }

  // Swipe Navigation Sequence
  const tabSequence = useMemo(() => {
    const sequence = ['posts', 'reposts'];
    if (showActivityTab) sequence.push('activity');
    sequence.push('trending');
    return sequence;
  }, [showActivityTab]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabSequence.indexOf(defaultTab);
      if (currentIndex < tabSequence.length - 1) {
        router.push(`/profile/${userId}?tab=${tabSequence[currentIndex + 1]}`, { scroll: false });
      }
    },
    onSwipedRight: () => {
      const currentIndex = tabSequence.indexOf(defaultTab);
      if (currentIndex > 0) {
        router.push(`/profile/${userId}?tab=${tabSequence[currentIndex - 1]}`, { scroll: false });
      }
    },
    trackMouse: true,
  });

  return (
    <>
      <div className="flex flex-col h-full bg-background" {...swipeHandlers}>
        <main className="flex-1 overflow-y-auto bg-card no-scrollbar">
          <div className="p-2">
            <div className="flex items-start gap-3">
               <div 
                className={cn(
                  "relative rounded-full p-0.5", 
                  user.hasStory && "bg-gradient-to-tr from-accent to-primary"
                )}
              >
                <Avatar 
                    user={user}
                    onStoryOpen={handleOpenStory}
                    className="h-14 w-14 border-2 border-card"
                >
                  <AvatarImage
                    src={user.avatar.imageUrl}
                    alt={user.name}
                  />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-bold text-lg leading-tight truncate">{user.name}</h2>
                </div>
                <div className="flex items-center gap-2 mt-0">
                  <span className="text-[11px] text-muted-foreground">@{user.id}</span>
                  <p className="text-[10px] leading-tight font-bold uppercase text-muted-foreground">{user.accountType}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 overflow-hidden">
                  {user.location && (
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-tight truncate">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <Link href={`/profile/${userId}/feed`} className='flex items-center gap-1 font-medium shrink-0'>
                    <span className="text-[11px] font-bold uppercase">{totalPostsAndReels} posts</span>
                    <ExternalLink className='h-3 w-3' />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 mt-2 px-1">
              {user.bio && (
                <p className="text-sm mt-0.5 leading-relaxed whitespace-pre-wrap text-left">{user.bio}</p>
              )}
              
              {user.creatorSubjects && user.creatorSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                    {user.creatorSubjects.map((subject) => (
                        <span 
                            key={subject} 
                            className="text-[10px] font-bold text-primary uppercase tracking-wider"
                        >
                            #{subject.replace(/\s+/g, '')}
                        </span>
                    ))}
                </div>
              )}

              {user.website && (
                <Link 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mt-1 group"
                >
                  <div className="relative h-3.5 w-3.5 rounded-sm overflow-hidden flex-shrink-0 bg-muted/50 border border-border/50 group-hover:border-primary/50 transition-colors">
                     <Image 
                        src={`https://www.google.com/s2/favicons?domain=${getDomain(user.website)}&sz=64`}
                        alt=""
                        fill
                        className="object-contain"
                     />
                  </div>
                  <span className="truncate">{user.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                </Link>
              )}
            </div>
            
            <div className="flex justify-start gap-3 items-center text-[11px] text-muted-foreground mt-3 py-1 border-y border-border/10 my-1">
              <Link href={`/profile/${userId}/lists?tab=followers`} className="flex items-center gap-1">
                  <span className="font-bold text-foreground">{formatNumberSafe(followerCount)}</span>
                  <span className="font-bold uppercase tracking-tight">Followers</span>
              </Link>
              <Link href={`/profile/${userId}/lists?tab=following`} className="flex items-center gap-1">
                  <span className="font-bold text-foreground">{formatNumberSafe(user.following.length)}</span>
                  <span className="font-bold uppercase tracking-tight">Following</span>
              </Link>
              <Link href={`/profile/${userId}/lists?tab=connections`} className="flex items-center gap-1">
                  <span className="font-bold text-foreground">{formatNumberSafe(connectionsCount)}</span>
                  <span className="font-bold uppercase tracking-tight">Connect</span>
              </Link>
            </div>

            {mutualConnections.length > 0 && (
                <div className="mt-1 px-1 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {mutualConnections.slice(0, 3).map((u, i) => (
                                <Avatar key={u.id} className="h-5 w-5 border-2 border-background ring-0 shadow-sm" style={{ zIndex: 3 - i }}>
                                    <AvatarImage src={u.avatar.imageUrl} />
                                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Mutual with <span className="font-bold text-foreground">{mutualConnections[0].name}</span>
                            {mutualConnections.length > 1 && (
                                <> and <span className="font-bold text-foreground">{mutualConnections.length - 1} others</span></>
                            )}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 mt-1 pb-1">
              {!isCurrentUser && (
                <Button 
                    variant={isFollowing ? "outline" : "secondary"} 
                    size="sm" 
                    onClick={handleFollowToggle}
                    className="h-8 px-4 font-bold text-xs rounded-[8px]"
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-foreground border rounded-[8px] px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors outline-none focus:ring-1 focus:ring-primary/30">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Message</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl bg-background/95">
                  <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10 focus:text-primary transition-all duration-200 cursor-pointer">
                    <Link href={`/messages/${user.id}?tab=personal`} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="p-1.5 rounded-lg bg-accent group-focus:bg-primary/20">
                        <UserCircle className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm">Personal Message</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Standard social interaction</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10 focus:text-primary transition-all duration-200 cursor-pointer">
                    <Link href={`/messages/${user.id}?tab=professional`} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm">Professional Message</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Business communication tab</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {((!isCurrentUser && user.accountType !== 'private') || isCurrentUser) && (
                <a 
                  href={`mailto:${user.email}`} 
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground border rounded-[8px] px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Mail</span>
                </a>
              )}

              {isCurrentUser && (
                <Link href="/saved" className="flex items-center gap-1.5 text-xs font-bold text-foreground border rounded-[8px] px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors">
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Save</span>
                </Link>
              )}
            </div>
          </div>

          <Tabs value={defaultTab} onValueChange={(val) => router.push(`/profile/${userId}?tab=${val}`, { scroll: false })} className="w-full">
            <TabsList className={cn("w-full h-auto justify-start rounded-none bg-transparent p-0 border-b grid", getGridCols())}>
              <TabsTrigger value="posts" className='rounded-none text-xs font-bold uppercase py-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary'>
                Posts
              </TabsTrigger>
              <TabsTrigger value="reposts" className='rounded-none text-xs font-bold uppercase py-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary'>
                Reposts
              </TabsTrigger>
              {showActivityTab && (
                <TabsTrigger value="activity" className='rounded-none text-xs font-bold uppercase py-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary'>
                  Pulse
                </TabsTrigger>
              )}
              <TabsTrigger value="trending" className='rounded-none text-xs font-bold uppercase py-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary'>
                Trend
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-0">
              <div className="flex flex-col">
                {allUserContent.length > 0 ? (
                  allUserContent.map((item, idx) => {
                    if ('videoUrl' in item) {
                        return <ReelCard key={`reel-${item.id}-${idx}`} reel={item} />;
                    }
                    if(item.postType === 'public_pulse'){
                      return <ActivityPostCard key={`post-${item.id}-${idx}`} post={item} />;
                    }
                    return <PostCard key={`post-${item.id}-${idx}`} post={item} />;
                  })
                ) : (
                  <div className="text-center py-20 text-muted-foreground font-medium">
                    <p>No posts yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
                {userTrendingReels.length > 0 ? (
                <div className="flex flex-col">
                    {userTrendingReels.map((reel) => (
                       <ReelCard key={`trending-${reel.id}`} reel={reel} />
                    ))}
                </div>
                ) : (
                <div className="text-center py-20 text-muted-foreground font-medium">
                    <p>No trending reels yet.</p>
                </div>
                )}
            </TabsContent>
             <TabsContent value="reposts" className="mt-0">
              <div className="flex flex-col">
                {userReposts.length > 0 ? (
                  userReposts.map((item) => {
                    const isReel = 'videoUrl' in item;
                    // If it's a quote post authored by the profile user, we don't pass repostedBy 
                    // because the card already shows them as author and has a "Reposted" badge
                    const isAuthor = !isReel && (item as Post).user.id === userId && !!(item as Post).quotedPost;

                    if (isReel) {
                        return <ReelCard key={`repost-${item.id}`} reel={item as Reel} repostedBy={isAuthor ? undefined : user} />;
                    }
                    const post = item as Post;
                    if (post.postType === 'public_pulse') {
                        return <ActivityPostCard key={`repost-${item.id}`} post={post} repostedBy={isAuthor ? undefined : user} />;
                    }
                    return <PostCard key={`repost-${item.id}`} post={post} repostedBy={isAuthor ? undefined : user} />;
                  })
                ) : (
                  <div className="text-center py-20 text-muted-foreground font-medium">
                    <p>No reposts yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-0">
                {userPublicPosts.length > 0 ? (
                    <div className="flex flex-col">
                      {userPublicPosts.map((post) => (
                          <ActivityPostCard key={`activity-${post.id}`} post={post} />
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground font-medium">
                    <p>No activity yet.</p>
                    </div>
                )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
       {isViewerOpen && selectedStory && (
        <StoryViewer
          key={selectedStory.id}
          story={selectedStory}
          onClose={handleCloseStory}
          onNext={handleNextStory}
          onPrevious={handleCloseStory}
        />
      )}
    </>
  );
}

export default function ProfilePage({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<{ tab?: string }> }) {
    const { userId } = React.use(params);
    const { tab } = React.use(searchParams);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
            <ProfilePageComponent userId={userId} initialTab={tab} />
        </Suspense>
    )
}
