
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Users as GroupIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { users as allUsers, currentUser } from '@/lib/data';
import type { User } from '@/lib/data';

const availableUsers = allUsers.filter(u => u.id !== currentUser.id);

export default function NewGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  };

  const handleCreateGroup = () => {
    if (selectedUsers.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No users selected',
        description: 'Please select at least one user to start a chat.',
      });
      return;
    }
    
    if (selectedUsers.size === 1) {
        const userId = Array.from(selectedUsers)[0];
        router.push(`/messages/${userId}`);
        return;
    }

    const selectedUserNames = availableUsers
      .filter(u => selectedUsers.has(u.id))
      .map(u => u.name)
      .join(', ');

    toast({
      title: 'Group Created!',
      description: `You started a group chat with: ${selectedUserNames}`,
    });
    router.push('/messages');
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-card">
      <header className="flex items-center p-3 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="ml-2">
          <h1 className="font-bold text-base">New Message</h1>
          <p className="text-xs text-muted-foreground">Select one or more people</p>
        </div>
      </header>
      <div className="p-4 border-b">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search for people..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      <ScrollArea className="flex-1 no-scrollbar">
        <div className="p-4 space-y-4">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleUserSelect(user.id)}
            >
              <Checkbox
                id={`user-${user.id}`}
                checked={selectedUsers.has(user.id)}
                onCheckedChange={() => handleUserSelect(user.id)}
              />
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                <p className="font-semibold">{user.name}</p>
                
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t">
        <Button
          className="w-full"
          onClick={handleCreateGroup}
          disabled={selectedUsers.size === 0}
        >
          {selectedUsers.size > 1 ? (
            <>
              <GroupIcon className="mr-2 h-5 w-5" />
              Create Group Chat
            </>
          ) : (
            'Start Chat'
          )}
        </Button>
      </footer>
    </div>
  );
}
