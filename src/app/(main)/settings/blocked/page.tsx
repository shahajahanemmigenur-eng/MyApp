'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserX, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser, users as allUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function BlockedUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Local state to simulate unblocking
  const [blockedIds, setBlockedIds] = useState<string[]>(currentUser.blockedUsers);

  const blockedUsers = allUsers.filter(u => blockedIds.includes(u.id));

  const handleUnblock = (userId: string, userName: string) => {
    setBlockedIds(prev => prev.filter(id => id !== userId));
    // In a real app, this would update the backend
    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id !== userId);
    
    toast({
      title: 'User Unblocked',
      description: `${userName} has been removed from your blocked list.`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b sticky top-0 bg-background z-20">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-base font-bold ml-2">Blocked Accounts</h1>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 bg-accent/30 flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
                When you block someone, they won't be able to find your profile, posts or story on G Post. People won't be notified when you block them.
            </p>
        </div>

        <div className="p-4 space-y-6">
          {blockedUsers.length > 0 ? (
            blockedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={user.avatar.imageUrl} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{user.name}</span>
                    <span className="text-xs text-muted-foreground">@{user.id}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-4 text-[11px] font-bold rounded-xl"
                  onClick={() => handleUnblock(user.id, user.name)}
                >
                  Unblock
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 opacity-50">
                <UserX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold">No Blocked Accounts</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Accounts you block will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
