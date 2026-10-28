'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, User as UserIcon, LoaderCircle } from "lucide-react";
import Link from 'next/link';
import { users as allUsers, currentUser } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Suspense, useState, useEffect } from 'react';

const allAppUsers = [currentUser, ...allUsers];

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(query);

    useEffect(() => {
        setSearchTerm(query);
    }, [query]);

    const filteredUsers = React.useMemo(() => {
        if (!query.trim()) return [];
        return allAppUsers.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.id.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            router.push(`/search/results?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="flex flex-col bg-background flex-1">
            <header className="sticky top-0 z-20 pt-3 bg-card shrink-0 border-b">
                <div className="flex items-center gap-2 px-3 pb-3">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9 text-sm rounded-full h-10 bg-accent/30 border border-border focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>
            </header>
            <main className="flex-1 flex flex-col bg-accent/5">
                <div className="px-4 py-3 border-b bg-card">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <UserIcon className="h-3 w-3" />
                        Accounts for "{query}"
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-3 p-3 rounded-2xl bg-card border hover:bg-accent transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={user.avatar.imageUrl} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-bold text-sm leading-tight">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">@{user.id}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground font-medium">No users found for "{query}".</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Try a different name or username.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    const q = React.use(searchParams).q;

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><LoaderCircle className="animate-spin text-primary" /></div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
