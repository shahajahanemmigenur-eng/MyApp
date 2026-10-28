
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserCommentsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b bg-card z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-bold text-lg ml-2">Comments</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="p-6 rounded-full bg-accent/50 mb-4">
          <MessageCircle className="h-10 w-10 opacity-20" />
        </div>
        <h2 className="font-bold text-foreground">No Activity Yet</h2>
        <p className="text-xs mt-1 max-w-[200px]">A summary of your comments and interactions on posts will be shown here.</p>
      </main>
    </div>
  );
}
