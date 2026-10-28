'use client';

import { useEffect, useRef } from 'react';
import { useVideoMute } from '@/context/video-mute-context';
import { cn } from '@/lib/utils';

export function VideoPlayer({ src, autoPlay = true, className }: { src: string, autoPlay?: boolean, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isGloballyMuted, setActivePlayer } = useVideoMute();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isGloballyMuted;
    }
  }, [isGloballyMuted]);

  useEffect(() => {
    if (!autoPlay || !src || typeof src !== 'string' || !src.trim()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video || !src) return;

        if (entry.isIntersecting) {
          setActivePlayer(videoRef);
          if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || video.error) {
            return;
          }
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              // Gracefully handle browser autoplay blocks, missing sources, or interruptions
              if (
                error.name !== 'AbortError' &&
                error.name !== 'NotAllowedError' &&
                error.name !== 'NotSupportedError' &&
                !error.message?.includes('no supported sources')
              ) {
                console.error("Autoplay failed:", error);
              }
            });
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      },
      { threshold: 0.5 }
    );

    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, [setActivePlayer, autoPlay, src]);

  if (!src || typeof src !== 'string' || !src.trim()) {
    return null;
  }

  return <video ref={videoRef} src={src} loop muted playsInline className={cn("w-full h-auto block object-cover", className)} />;
}
