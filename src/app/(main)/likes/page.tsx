'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export default function LikesPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b bg-card z-10 shrink-0">
        <h1 className="font-bold text-lg ml-2">Likes</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="p-6 rounded-full bg-accent/50 mb-4">
          <Heart className="h-10 w-10 opacity-20" />
        </div>
        <h2 className="font-bold text-foreground">No Likes Yet</h2>
        <p className="text-xs mt-1 max-w-[200px]">Posts and reels you've liked will be visible here so you can revisit them anytime.</p>
      </main>
    </div>
  );
}