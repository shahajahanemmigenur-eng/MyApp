'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import { users } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Mock data for shared media. In a real app, this would be fetched.
const sharedImages = [
    { id: 'img4', url: 'https://picsum.photos/seed/shared4/400/400', type: 'image' },
    { id: 'img3', url: 'https://picsum.photos/seed/shared3/500/500', type: 'image' },
    { id: 'img2', url: 'https://picsum.photos/seed/shared2/300/400', type: 'image' },
    { id: 'img1', url: 'https://picsum.photos/seed/shared1/400/300', type: 'image' },
];

const sharedVideos = [
    { id: 'vid1', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://picsum.photos/seed/vid1/400/400', type: 'video' },
];


export default function SharedMediaPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = React.use(params);
    const router = useRouter();
    const otherUser = users.find((u) => u.id === userId);

    if (!otherUser) {
        return notFound();
    }

    return (
        <div className="flex flex-col h-full bg-card">
            <header className="flex items-center justify-between p-3 border-b shrink-0">
                 <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="ml-2">
                        <h1 className="font-bold text-base">{otherUser.name}</h1>
                        <p className="text-xs text-muted-foreground">Shared Media</p>
                    </div>
                </div>
                 <Button variant="ghost" size="icon" asChild>
                    <Link href={`/profile/${userId}`}>
                        <div className="flex h-10 w-10 items-center justify-center">
                             <Info className="h-6 w-6" />
                        </div>
                    </Link>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto">
                <Tabs defaultValue="photos" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="photos">Photos</TabsTrigger>
                        <TabsTrigger value="videos">Videos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="photos">
                        <div className="grid grid-cols-3 gap-0.5 p-0.5">
                            {sharedImages.map(media => (
                                <div key={media.id} className="relative aspect-square">
                                    <Image src={media.url} alt="Shared media" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                         {sharedImages.length === 0 && (
                            <p className="text-center text-muted-foreground mt-8">No photos shared yet.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="videos">
                        <div className="grid grid-cols-3 gap-0.5 p-0.5">
                             {sharedVideos.map(media => (
                                <div key={media.id} className="relative aspect-square">
                                    <Image src={media.thumbnailUrl} alt="Shared video thumbnail" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {sharedVideos.length === 0 && (
                            <p className="text-center text-muted-foreground mt-8">No videos shared yet.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
