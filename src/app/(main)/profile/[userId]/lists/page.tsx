'use client';

import * as React from 'react';
import { Suspense, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { users, currentUser as loggedInUser } from '@/lib/data';
import type { User } from '@/lib/data';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type StatType = 'followers' | 'following' | 'connections';

const UserList = ({ users: initialUsers, title }: { users: User[], title: string }) => {
    const { toast } = useToast();
    const [usersList, setUsersList] = useState(initialUsers);

    const handleFollowToggle = (userId: string) => {
        const user = usersList.find(u => u.id === userId);
        if (!user) return;

        const isFollowing = loggedInUser.following.includes(userId);

        if (isFollowing) {
            loggedInUser.following = loggedInUser.following.filter(id => id !== userId);
            toast({
                title: 'User Unfollowed',
                description: `You have unfollowed ${user.name}.`,
            });
        } else {
            loggedInUser.following.push(userId);
            toast({
                title: 'User Followed',
                description: `You are now following ${user.name}.`,
            });
        }
        setUsersList([...usersList]);
    };

    return (
        <div className="space-y-3">
            {usersList.map(listUser => {
                const isFollowing = loggedInUser.following.includes(listUser.id);
                return (
                    <div key={listUser.id} className="flex items-center justify-between">
                        <Link href={`/profile/${listUser.id}`} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={listUser.avatar.imageUrl} alt={listUser.name} data-ai-hint={listUser.avatar.imageHint} />
                                <AvatarFallback>{listUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold">{listUser.name}</p>
                            </div>
                        </Link>
                        {listUser.id !== loggedInUser.id && (
                            <div className="flex gap-1">
                                {title === 'Followers' && (
                                     <Button size="sm" variant="secondary" onClick={() => handleFollowToggle(listUser.id)} className='h-6 px-2.5 rounded-[6px] text-[10px] font-bold'>
                                        {isFollowing ? 'Following' : 'Follow Back'}
                                     </Button>
                                )}
                                {(title === 'Following' || title === 'Connect') && (
                                    <Button size="sm" variant={isFollowing ? 'secondary' : 'default'} onClick={() => handleFollowToggle(listUser.id)} className='h-6 px-2.5 rounded-[6px] text-[10px] font-bold'>
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    );
};

function ListsPageComponent({ userId, tab }: { userId: string, tab?: StatType }) {
    const user = users.find(u => u.id === userId) || (userId === loggedInUser.id ? loggedInUser : null);
    
    if (!user) {
        return notFound();
    }
    
    const allAppUsers = [loggedInUser, ...users];

    const getConnections = (u: User) => {
        return allAppUsers.filter(usr => u.connections.includes(usr.id));
    }
    
    const mockUsers = {
        followers: allAppUsers.filter(u => u.following.includes(user.id)),
        following: allAppUsers.filter(u => u.following.includes(user.id)),
        connections: getConnections(user),
    };
    
    return (
        <div className="flex flex-col h-full bg-background">
            <main className="flex-1 overflow-y-auto bg-card">
                 <Tabs defaultValue={tab || 'followers'} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-0 bg-transparent rounded-none border-b">
                        <TabsTrigger value="followers" className="rounded-none py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Followers</TabsTrigger>
                        <TabsTrigger value="following" className="rounded-none py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Following</TabsTrigger>
                        <TabsTrigger value="connections" className="rounded-none py-3 text-xs font-bold uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Connect</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-[calc(100vh-150px)] no-scrollbar">
                        <div className="p-4">
                            <TabsContent value="followers" className="mt-0">
                                <UserList users={mockUsers.followers} title="Followers" />
                            </TabsContent>
                            <TabsContent value="following" className="mt-0">
                                <UserList users={mockUsers.following} title="Following" />
                            </TabsContent>
                            <TabsContent value="connections" className="mt-0">
                                <UserList users={mockUsers.connections} title="Connect" />
                            </TabsContent>
                        </div>
                    </ScrollArea>
                 </Tabs>
            </main>
        </div>
    );
}

export default function ListsPage({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<{ tab?: StatType }> }) {
    const { userId } = React.use(params);
    const { tab } = React.use(searchParams);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
            <ListsPageComponent userId={userId} tab={tab} />
        </Suspense>
    )
}
