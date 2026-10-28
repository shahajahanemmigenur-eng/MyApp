'use client';

import React from 'react';
import { Archive } from 'lucide-react';

export default function ArchivePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b bg-card z-10 shrink-0">
        <h1 className="font-bold text-lg ml-2">Archive</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="p-6 rounded-full bg-accent/50 mb-4">
          <Archive className="h-10 w-10 opacity-20" />
        </div>
        <h2 className="font-bold text-foreground">No Archived Content</h2>
        <p className="text-xs mt-1 max-w-[200px]">Your archived posts and stories will appear here when you move them out of your profile.</p>
      </main>
    </div>
  );
}