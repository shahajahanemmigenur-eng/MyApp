'use client';

import { createContext, useState, useContext, ReactNode, useCallback, RefObject } from 'react';

type VideoMuteContextType = {
  isGloballyMuted: boolean;
  setGlobalMute: (muted: boolean) => void;
  activePlayer: RefObject<HTMLVideoElement> | null;
  setActivePlayer: (player: RefObject<HTMLVideoElement> | null) => void;
};

const VideoMuteContext = createContext<VideoMuteContextType | undefined>(undefined);

export function VideoMuteProvider({ children }: { children: ReactNode }) {
  const [isGloballyMuted, setIsGloballyMuted] = useState(true);
  const [activePlayer, setActivePlayerState] = useState<RefObject<HTMLVideoElement> | null>(null);

  const setGlobalMute = useCallback((muted: boolean) => {
    setIsGloballyMuted(muted);
  }, []);

  const setActivePlayer = useCallback((player: RefObject<HTMLVideoElement> | null) => {
    if (activePlayer && activePlayer.current && activePlayer !== player) {
      activePlayer.current.pause();
    }
    setActivePlayerState(player);
  }, [activePlayer]);

  return (
    <VideoMuteContext.Provider value={{ isGloballyMuted, setGlobalMute, activePlayer, setActivePlayer }}>
      {children}
    </VideoMuteContext.Provider>
  );
}

export function useVideoMute() {
  const context = useContext(VideoMuteContext);
  if (context === undefined) {
    throw new Error('useVideoMute must be used within a VideoMuteProvider');
  }
  return context;
}
