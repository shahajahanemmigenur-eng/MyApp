
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { BottomNav } from '@/components/bottom-nav';
import { MobileMockup } from '@/components/mobile-mockup';
import { LoaderCircle, RefreshCw, Plus } from 'lucide-react';
import { VideoMuteProvider } from '@/context/video-mute-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSwipeable } from 'react-swipeable';

const PULL_THRESHOLD = 80;

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  // Visibility states
  const [isNavForcedHidden, setIsNavForcedHidden] = useState(false);
  const [isNavScrollingHidden, setIsNavScrollingHidden] = useState(false);
  const lastScrollY = useRef(0);
  
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const updateTopics = () => {
      const saved = localStorage.getItem('pulse:selected-topics');
      if (saved) {
        try {
          setSelectedTopics(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse selected topics in main layout:", e);
          setSelectedTopics([]);
        }
      }
    };
    updateTopics();
    window.addEventListener('storage', updateTopics);
    window.addEventListener('sociverse:topic-selected', updateTopics);
    return () => {
      window.removeEventListener('storage', updateTopics);
      window.removeEventListener('sociverse:topic-selected', updateTopics);
    };
  }, []);

  useEffect(() => {
    const handleVisibility = (e: any) => {
        setIsNavForcedHidden(!e.detail);
    };
    window.addEventListener('sociverse:nav-visibility', handleVisibility as EventListener);
    return () => window.removeEventListener('sociverse:nav-visibility', handleVisibility as EventListener);
  }, []);

  // Ensure navigation is reset when changing pages
  useEffect(() => {
    setIsNavForcedHidden(false);
    setIsNavScrollingHidden(false);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

    if (currentScrollY <= 0) {
      setIsNavScrollingHidden(false);
    } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      if (!isNavScrollingHidden) setIsNavScrollingHidden(true);
    } else if (currentScrollY < lastScrollY.current - 10) {
      if (isNavScrollingHidden) setIsNavScrollingHidden(false);
    }
    lastScrollY.current = currentScrollY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop <= 0) {
      setPullStart(e.touches[0].clientY);
    } else {
      setPullStart(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStart === null) return;
    const pullDist = e.touches[0].clientY - pullStart;
    if (pullDist > 0) {
      if (e.cancelable) e.preventDefault();
      // Apply dampening for natural feel
      const dampenedDist = Math.pow(pullDist, 0.85);
      setPullDistance(dampenedDist);
    }
  };

  const handleTouchEnd = () => {
    if (pullStart === null) return;
    if (pullDistance > PULL_THRESHOLD) {
      setIsRefreshing(true);
      // Content only refreshes on manual pull
      setTimeout(() => {
        window.location.reload();
      }, 600); 
    }
    setPullStart(null);
    setPullDistance(0);
  };

  const handleSearchToggle = () => {
    window.dispatchEvent(new CustomEvent('sociverse:toggle-search'));
  };

  // Swipe Navigation Logic for Pulse Topics
  const isPulsePage = pathname === '/activity' || pathname.startsWith('/explore/');
  const topicsSequence = ['Trending', ...selectedTopics.map(t => t.replace(/^[^\s]+\s+/, ''))];
  
  const getCurrentTopicIndex = () => {
    if (pathname === '/activity') return 0;
    const currentTag = decodeURIComponent(pathname.split('/').pop() || '');
    return topicsSequence.indexOf(currentTag);
  };

  const navigateToTopic = (index: number) => {
    if (index < 0 || index >= topicsSequence.length) return;
    const topic = topicsSequence[index];
    if (topic === 'Trending') {
      router.push('/activity');
    } else {
      router.push(`/explore/${encodeURIComponent(topic)}`);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isPulsePage) {
        const currentIdx = getCurrentTopicIndex();
        if (currentIdx !== -1 && currentIdx < topicsSequence.length - 1) {
          navigateToTopic(currentIdx + 1);
        }
      }
    },
    onSwipedRight: () => {
      if (isPulsePage) {
        const currentIdx = getCurrentTopicIndex();
        if (currentIdx !== -1 && currentIdx > 0) {
          navigateToTopic(currentIdx - 1);
        }
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 50
  });

  const isCommentsPage = pathname.endsWith('/comments');
  const isReelsPage = pathname === '/reels';

  const shouldShowHeader = (pathname === '/home' || 
    pathname === '/activity' || 
    pathname === '/notifications' || 
    pathname.startsWith('/explore') || 
    pathname === '/messages' || 
    pathname === '/saved' || 
    pathname === '/for-you' || 
    pathname === '/cc-studio' || 
    pathname === '/monetization' || 
    pathname === '/account' ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/post')) && !isCommentsPage;

  const shouldShowBottomNav = !isCommentsPage; 
  // Restricted pull-to-refresh targets
  const isPullToRefreshPage = pathname === '/home' || pathname.startsWith('/search') || pathname === '/activity' || pathname === '/messages';
  const shouldShowFAB = (pathname === '/home' || pathname === '/activity') && !isCommentsPage;
  const showDiscoveryBar = pathname === '/activity' || pathname.startsWith('/explore/');
  const headerPadding = shouldShowHeader ? (showDiscoveryBar ? "pt-[110px]" : "pt-16") : "pt-0";

  const isEffectivelyHidden = isNavForcedHidden || isNavScrollingHidden;

  return (
    <div className="flex justify-center items-center h-full bg-slate-200 p-4">
      <MobileMockup>
        <div className="flex flex-col h-full bg-card overflow-hidden relative" {...swipeHandlers}>
          {isClient ? (
            <VideoMuteProvider>
                <div 
                  className={cn(
                    "absolute top-0 left-0 right-0 z-[60] transition-transform duration-300 ease-in-out",
                    isEffectivelyHidden && "-translate-y-full"
                  )}
                >
                  {shouldShowHeader && <AppHeader onSearchToggle={handleSearchToggle} />}
                </div>

                <main 
                  ref={mainRef} 
                  onScroll={handleScroll}
                  className={cn(
                    "flex-1 no-scrollbar relative flex flex-col",
                    (!isCommentsPage && !isReelsPage) && "overflow-y-auto",
                    (isCommentsPage || isReelsPage) && "overflow-hidden",
                    headerPadding,
                    shouldShowBottomNav && "pb-16"
                  )}
                  onTouchStart={isPullToRefreshPage ? handleTouchStart : undefined}
                  onTouchMove={isPullToRefreshPage ? handleTouchMove : undefined}
                  onTouchEnd={isPullToRefreshPage ? handleTouchEnd : undefined}
                  style={{ 
                    top: isPullToRefreshPage && !isRefreshing ? `${Math.min(pullDistance, PULL_THRESHOLD + 40)}px` : '0px',
                    transition: pullStart === null ? 'top 0.4s cubic-bezier(0.2, 0, 0.2, 1)' : 'none'
                  }}
                >
                  {isPullToRefreshPage && (
                    <div 
                      className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none"
                      style={{ 
                        transform: `translateY(-100%) translateY(${Math.min(pullDistance, PULL_THRESHOLD + 40)}px)`,
                        transition: pullStart === null ? 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)' : 'none',
                        zIndex: 50
                      }}
                    >
                      <div className="p-6">
                        {isRefreshing ? (
                          <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
                        ) : (
                          <RefreshCw
                            className={cn(
                              "w-6 h-6 text-muted-foreground transition-all duration-300",
                              pullDistance > PULL_THRESHOLD && "rotate-180 text-primary scale-110"
                            )}
                            style={{ opacity: Math.min(pullDistance / PULL_THRESHOLD, 1) }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {children}
                </main>

                {shouldShowFAB && (
                  <div 
                    className={cn(
                      "absolute bottom-20 right-4 z-40 transition-all duration-300 ease-in-out",
                      isEffectivelyHidden ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                    )}
                  >
                    <Button
                      asChild
                      size="icon"
                      className="h-12 w-12 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link href="/create">
                        <Plus className="h-6 w-6" strokeWidth={3} />
                        <span className="sr-only">Create Post</span>
                      </Link>
                    </Button>
                  </div>
                )}

                <div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 z-[55] transition-transform duration-300 ease-in-out",
                    isEffectivelyHidden && "translate-y-full"
                  )}
                >
                   {shouldShowBottomNav && <BottomNav />}
                </div>
            </VideoMuteProvider>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <LoaderCircle className="w-10 h-10 animate-spin" />
            </div>
          )}
        </div>
      </MobileMockup>
    </div>
  );
}
