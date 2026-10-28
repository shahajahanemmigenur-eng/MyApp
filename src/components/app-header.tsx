'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  Star, 
  Moon, 
  Sun, 
  LogOut, 
  UserCircle, 
  LayoutGrid,
  Wand2,
  Settings,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  Plus,
  TrendingUp,
  ChevronLeft,
  Pencil,
  Link as LinkIcon,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { currentUser, pulseTopics, users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

function AppHeaderContent({ onSearchToggle }: { onSearchToggle?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTopicRef = useRef<HTMLDivElement>(null);

  const [isLinked, setIsLinked] = useState(false);

  const currentTab = searchParams.get('tab');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('pulse:selected-topics');
    if (saved) {
      try {
        setSelectedTopics(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse selected topics in app header:", e);
        setSelectedTopics([]);
      }
    }
  }, []);

  useEffect(() => {
    const handleTopicSelected = (e: CustomEvent<string>) => {
      const topic = e.detail;
      setSelectedTopics(prev => {
        const isSelected = prev.includes(topic);
        const next = isSelected 
          ? prev.filter(t => t !== topic) 
          : [...prev, topic];
        localStorage.setItem('pulse:selected-topics', JSON.stringify(next));
        return next;
      });
    };
    window.addEventListener('sociverse:topic-selected', handleTopicSelected as EventListener);
    return () => window.removeEventListener('sociverse:topic-selected', handleTopicSelected as EventListener);
  }, []);

  useEffect(() => {
    if (scrollRef.current && activeTopicRef.current) {
        const container = scrollRef.current;
        const activeItem = activeTopicRef.current;
        const scrollLeft = activeItem.offsetLeft - (container.offsetWidth / 2) + (activeItem.offsetWidth / 2);
        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
  }, [pathname, selectedTopics]);

  useEffect(() => {
    if (pathname.startsWith('/profile/')) {
        const parts = pathname.split('/');
        const profileId = parts[2];
        if (profileId && profileId !== currentUser.id) {
            setIsLinked(currentUser.connections.includes(profileId));
        }
    }
  }, [pathname]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
        const parts = pathname.split('/');
        const currentProfileId = parts[2];
        if (pathname.startsWith('/profile/') && e.detail?.userId === currentProfileId) {
            setIsLinked(currentUser.connections.includes(currentProfileId));
        }
    };
    window.addEventListener('sociverse:connections-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('sociverse:connections-updated', handleUpdate as EventListener);
  }, [pathname]);
  
  const isHomePage = pathname === '/home';
  const isMessagesListPage = pathname === '/messages';
  const isActivityPage = pathname === '/activity' || pathname === '/explore/topics' || pathname.startsWith('/explore/') || pathname === '/search/trending';
  const isNotificationsPage = pathname === '/notifications';
  const isExplorePage = pathname.startsWith('/explore');
  const isSavedPage = pathname === '/saved';
  const isForYouPage = pathname === '/for-you';
  const isAccountPage = pathname === '/account';
  const isCCStudioPage = pathname === '/cc-studio';
  const isMonetizationPage = pathname === '/monetization';
  const isEditProfilePage = pathname === '/profile/edit';

  const isRootPage = pathname === '/home' || pathname === '/activity' || pathname === '/notifications' || pathname === '/reels' || pathname === '/messages' || pathname === '/search';

  const isTrendingActive = (pathname === '/activity' && !currentTab) || pathname === '/search/trending';

  const Logo = () => (
    <div className="flex flex-col items-center">
      <h1 className="text-sm font-bold uppercase tracking-tight leading-none">G Post</h1>
    </div>
  );

  const getTitle = () => {
    if (isHomePage) return <Logo />;
    if (isMessagesListPage) return null;
    if (isCCStudioPage) return <h1 className="text-lg font-bold">CC Studio</h1>;
    if (isMonetizationPage) return <h1 className="text-lg font-bold">Monetization</h1>;
    if (isActivityPage && pathname === '/activity') return <h1 className="text-lg font-bold ml-2">Public Pulse</h1>;
    if (pathname === '/search/trending') return <h1 className="text-lg font-bold">Universe Trends</h1>;
    if (pathname === '/explore/topics') return <h1 className="text-lg font-bold">Explore Topics</h1>;
    if (isNotificationsPage) return <h1 className="text-lg font-bold">Notifications</h1>;
    if (isSavedPage) return <h1 className="text-lg font-bold">Saved</h1>;
    if (isForYouPage) return <h1 className="text-lg font-bold">For You</h1>;
    if (isAccountPage) return <h1 className="text-lg font-bold">Account</h1>;
    if (isEditProfilePage) return <h1 className="text-base font-bold">Edit Profile</h1>;
    
    if (pathname.startsWith('/profile/')) {
        const parts = pathname.split('/');
        const userId = parts[2];
        return (
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-bold uppercase tracking-tight leading-none">Profile</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">@{userId}</p>
          </div>
        );
    }

    if (pathname.startsWith('/post/') && !pathname.endsWith('/comments')) {
        return <h1 className="text-base font-bold uppercase tracking-tight">Post</h1>;
    }

    if (isExplorePage && pathname !== '/explore/topics') {
        const parts = pathname.split('/');
        const lastPart = parts.pop() || '';
        return (
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-bold uppercase tracking-tight leading-none">#{decodeURIComponent(lastPart)}</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Explore</p>
          </div>
        );
    }
    return null;
  }
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push('/');
  }

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pathname.startsWith('/profile/')) return;
    const parts = pathname.split('/');
    const profileUserId = parts[2];
    if (!profileUserId || profileUserId === currentUser.id) return;
    
    const targetUser = users.find(u => u.id === profileUserId);
    if (!targetUser) return;

    const isCurrentlyLinked = currentUser.connections.includes(profileUserId);
    
    if (isCurrentlyLinked) {
      currentUser.connections = currentUser.connections.filter(id => id !== profileUserId);
      targetUser.connections = targetUser.connections.filter(id => id !== currentUser.id);
      setIsLinked(false);
      toast({ title: 'Unlinked!' });
    } else {
      currentUser.connections.push(profileUserId);
      if (!targetUser.connections.includes(currentUser.id)) {
          targetUser.connections.push(currentUser.id);
      }
      setIsLinked(true);
      toast({ title: 'Linked!' });
    }
    
    window.dispatchEvent(new CustomEvent('sociverse:connections-updated', { 
      detail: { userId: profileUserId } 
    }));
  };

  const renderLeftAction = () => {
    return (
      <div className="flex items-center gap-3">
        {isRootPage && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.name} data-ai-hint={currentUser.avatar.imageHint} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[75%] p-0 flex flex-col bg-card border-r shadow-2xl transition-all duration-300 fixed inset-y-0 left-0 h-full z-[60]">
              <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
              
              <div className="p-4 flex flex-col gap-1.5 border-b shrink-0">
                <div className="flex justify-between items-start">
                  <Link href={`/profile/${currentUser.id}`}>
                    <Avatar className="h-10 w-10 border border-background">
                      <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-yellow-500 to-red-500 shadow-lg shadow-primary/20 shrink-0">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div className="flex flex-col leading-tight mt-2">
                  <p className="font-bold text-lg">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">@{currentUser.id}</p>
                </div>
                
                <div className="flex gap-4 text-[10px] mt-2">
                  <Link href="#" className="hover:underline flex gap-1 items-center">
                    <span className="font-bold text-xs">{currentUser.following.length}</span> 
                    <span className="text-muted-foreground uppercase font-bold tracking-tight">Following</span>
                  </Link>
                  <Link href="#" className="hover:underline flex gap-1 items-center">
                    <span className="font-bold text-xs">1.2M</span> 
                    <span className="text-muted-foreground uppercase font-bold tracking-tight">Followers</span>
                  </Link>
                </div>
              </div>

              <ScrollArea className="flex-1 px-2 no-scrollbar">
                <div className="flex flex-col gap-1 py-4">
                  <MenuLink icon={User} label="Profile" href={`/profile/${currentUser.id}`} />
                  <MenuLink icon={Star} label="Premium" href="#" badge="New" />
                  <MenuLink icon={Wand2} label="CC Studio" href="/cc-studio" />
                  <MenuLink icon={UserCircle} label="Account" href="/account" />
                  <MenuLink icon={LayoutGrid} label="For You" href="/for-you" />
                  <MenuLink icon={Settings} label="Settings and privacy" href="/settings" />
                  <MenuLink icon={HelpCircle} label="Help Centre" href="#" />
                </div>
              </ScrollArea>

              <div className="p-4 bg-card border-t mt-auto shrink-0">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-accent/50"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 text-[11px] font-bold uppercase flex items-center gap-2 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        {!isRootPage && (
          <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        <div className={cn("flex items-center gap-2", !isHomePage && isRootPage ? "ml-1" : "")}>
            {isMessagesListPage && (
                <span className="font-bold text-lg text-foreground/90 ml-1">@{currentUser.id}</span>
            )}
        </div>
      </div>
    );
  }

  const renderRightActions = () => {
    const isProfilePage = pathname.startsWith('/profile/');
    const profileUserId = isProfilePage ? pathname.split('/')[2] : null;
    const isMyProfile = profileUserId === currentUser.id;

    if (isHomePage || isActivityPage || isExplorePage || isProfilePage || (pathname.startsWith('/post') && !pathname.endsWith('/comments'))) return (
      <div className="flex items-center gap-1.5">
        {isProfilePage && !isMyProfile && !isEditProfilePage && (
             <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                    "h-10 w-10 border-2 rounded-full transition-all shadow-sm",
                    isLinked ? "text-primary border-primary/20 bg-primary/5" : "text-muted-foreground border-border hover:bg-accent"
                )} 
                onClick={handleConnect}
            >
                <LinkIcon className="h-5 w-5" />
            </Button>
        )}

        {isMyProfile && !isEditProfilePage && (
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary border-2 border-primary/20 hover:bg-primary/10 rounded-full" asChild>
                <Link href="/profile/edit">
                  <Pencil className="h-5 w-5" />
                  <span className="sr-only">Edit Profile</span>
                </Link>
            </Button>
        )}
        <Button variant="ghost" size="icon" className="h-10 w-10 border-2 border-border hover:bg-accent rounded-full" asChild>
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>
      </div>
    );

    if(isMessagesListPage) return (
       <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={onSearchToggle}>
              <Search className="h-6 w-6" />
              <span className="sr-only">Search Messages</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                <Link href={`/profile/${currentUser.id}`}>
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={currentUser.avatar.imageUrl} />
                        <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Profile</span>
                </Link>
            </Button>
        </div>
    )

    return null;
  }

  const showSecondaryBar = isActivityPage;

  return (
    <header className="flex flex-col border-b bg-card z-10 shrink-0 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between px-3 h-16 w-full">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          {renderLeftAction()}
        </div>
        <div className="flex justify-center items-center flex-shrink-0">
          {getTitle()}
        </div>
        <div className="flex items-center justify-end gap-1 flex-1">
          {renderRightActions()}
        </div>
      </div>
      
      {showSecondaryBar && (
        <div className="pb-1 px-5 animate-in fade-in slide-in-from-top-1 duration-300 flex items-center">
          <Link href="/explore/topics" className={cn(
            "pr-6 shrink-0 transition-all active:scale-90",
            pathname === '/explore/topics' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Plus className="h-5 w-5" strokeWidth={3} />
          </Link>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-x-auto no-scrollbar scroll-smooth"
          >
            <div className="flex items-center gap-6">
                <div 
                    ref={isTrendingActive ? activeTopicRef : null}
                    className="flex flex-col items-center gap-1 shrink-0" 
                >
                    <div className="flex items-center gap-1 py-1">
                        <Link 
                          href="/activity"
                          className={cn(
                            "text-sm font-bold whitespace-nowrap transition-colors",
                            isTrendingActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Trending
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="outline-none hover:text-foreground transition-colors p-0.5">
                              <ChevronDown className={cn("h-3 w-3", isTrendingActive ? "text-foreground" : "text-muted-foreground")} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-64 max-h-[60vh] overflow-y-auto rounded-2xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl bg-background/95 z-[70]">
                            <DropdownMenuItem 
                              className="rounded-xl focus:bg-primary/10 focus:text-primary transition-all duration-200 cursor-pointer py-2.5 px-3"
                              onClick={() => router.push('/activity')}
                            >
                                <TrendingUp className="h-4 w-4 mr-3" />
                                <span className="font-bold text-sm">All Global Trends</span>
                            </DropdownMenuItem>
                            <Separator className="my-1.5 opacity-50" />
                            <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Public Pulse Topics</div>
                            {pulseTopics.map((topic) => {
                              const topicTag = topic.title.replace(/^[^\s]+\s+/, '');
                              return (
                                <DropdownMenuItem 
                                  key={topic.title}
                                  className="rounded-xl focus:bg-primary/10 focus:text-primary transition-all duration-200 cursor-pointer py-2.5 px-3"
                                  onClick={() => router.push(`/explore/${encodeURIComponent(topicTag)}`)}
                                >
                                    <span className="font-bold text-xs">{topic.title}</span>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {isTrendingActive && (
                      <div className="h-[2px] w-full bg-foreground rounded-full animate-in fade-in zoom-in-50 duration-300" />
                    )}
                </div>

                {selectedTopics.map((topic) => {
                    const topicTag = topic.replace(/^[^\s]+\s+/, '');
                    const topicPath = `/explore/${encodeURIComponent(topicTag)}`;
                    const isActive = pathname === topicPath;
                    return (
                        <div 
                            key={topic} 
                            ref={isActive ? activeTopicRef : null}
                            className="flex flex-col items-center gap-1 shrink-0"
                        >
                          <Link 
                              href={topicPath}
                              className="shrink-0 py-1"
                          >
                              <span className={cn(
                                "text-sm font-bold transition-colors whitespace-nowrap",
                                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                              )}>
                                  {topicTag}
                              </span>
                          </Link>
                          {isActive && (
                            <div className="h-[2px] w-full bg-foreground rounded-full animate-in fade-in zoom-in-50 duration-300" />
                          )}
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function AppHeader(props: { onSearchToggle?: () => void }) {
  return (
    <Suspense fallback={<header className="h-16 border-b bg-card" />}>
      <AppHeaderContent {...props} />
    </Suspense>
  );
}

function MenuLink({ icon: Icon, label, href, badge }: { icon: any, label: string, href: string, badge?: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 px-4 py-3 transition-colors group"
    >
      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary group-active:text-primary transition-colors" />
      <span className="font-semibold text-sm flex-1 text-muted-foreground group-hover:text-primary group-active:text-primary transition-colors">{label}</span>
      {badge && (
        <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
          {badge}
        </span>
      )}
    </Link>
  );
}
