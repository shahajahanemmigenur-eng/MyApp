'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { reels as allReels, posts as allPosts } from '@/lib/data';
import { ReelPlayer } from '@/components/reel-player';
import { useVideoMute } from '@/context/video-mute-context';

function ReelsPageContent() {
  const searchParams = useSearchParams();
  const initialReelId = searchParams.get('id');
  const { setGlobalMute } = useVideoMute();

  useEffect(() => {
    // Attempt to unmute for Reels experience
    setGlobalMute(false);

    return () => {
      setGlobalMute(true);
    };
  }, [setGlobalMute]);

  // Unified video feed logic: Show both standard reels and any posts that contain a videoUrl
  const videoFeed = React.useMemo(() => {
    const reelsFromData = [...allReels];
    const videosFromPosts = allPosts.filter(p => !!p.videoUrl).map(p => ({
        ...p,
        shares: (p as any).repostCount || 0,
        duration: 30, // Mock duration for posts if not specified
    }));
    return [...reelsFromData, ...videosFromPosts];
  }, []);

  const trendingVideos = React.useMemo(() => {
    const sortedVideos = [...videoFeed].sort((a, b) => b.likes - a.likes);
    
    if (!initialReelId) {
      return sortedVideos;
    }
    
    const initialVideo = sortedVideos.find(r => r.id === initialReelId);
    if (!initialVideo) {
        return sortedVideos;
    }

    const otherVideos = sortedVideos.filter(r => r.id !== initialReelId);
    return [initialVideo, ...otherVideos];
  }, [initialReelId, videoFeed]);

  return (
    <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll no-scrollbar bg-black">
      {trendingVideos.map((video) => (
        <div key={video.id} className="h-full w-full snap-start relative flex items-center justify-center">
            <ReelPlayer reel={video as any} />
        </div>
      ))}
    </div>
  );
}

export default function ReelsPage() {
    return (
        <Suspense fallback={
            <div className="h-full w-full relative bg-black flex items-center justify-center text-white">
                <LoaderCircle className="w-10 h-10 animate-spin" />
            </div>
        }>
            <ReelsPageContent />
        </Suspense>
    )
}
