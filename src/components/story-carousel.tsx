'use client';

import { useState, useEffect, useCallback } from 'react';
import { stories, currentUser } from '@/lib/data';
import type { Story } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { StoryViewer } from './story-viewer';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function StoryCarousel() {
    const router = useRouter();
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [allStories, setAllStories] = useState<Story[]>([]);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

    useEffect(() => {
        // Filter to only show actual stories from the data
        const activeStories = stories.filter(s => !s.id.startsWith('placeholder-'));
        
        // Find current user's story if it exists
        const currentUserStory = activeStories.find(s => s.user.id === currentUser.id);
        
        // Construct the list: Current User (always first, as placeholder if empty) + others with stories
        const storiesToShow = currentUserStory 
            ? [currentUserStory, ...activeStories.filter(s => s.user.id !== currentUser.id)]
            : [{ user: currentUser, id: `placeholder-${currentUser.id}`, image: currentUser.avatar }, ...activeStories];
            
        setAllStories(storiesToShow as Story[]);
    }, []);

    const openStory = (index: number) => {
        const story = allStories[index];
        if (!story) return;

        const isCurrentUserStory = story.user.id === currentUser.id;
        const hasActualStory = !story.id.startsWith('placeholder-');

        if (isCurrentUserStory && !hasActualStory) {
            router.push('/camera');
            return;
        }
        
        if (hasActualStory) {
            setSelectedStoryIndex(index);
            setIsViewerOpen(true);
        }
    };

    const closeStory = useCallback(() => {
        setIsViewerOpen(false);
    }, []);

    const goToNextStory = useCallback(() => {
        // Defer the index update to ensure it's not during render
        setTimeout(() => {
            setSelectedStoryIndex((prevIndex) => {
                let nextIndex = prevIndex + 1;
                while(nextIndex < allStories.length && allStories[nextIndex]?.id?.startsWith('placeholder-')) {
                    nextIndex++;
                }
                if (nextIndex >= allStories.length) {
                    closeStory();
                    return prevIndex;
                }
                return nextIndex;
            });
        }, 0);
    }, [allStories, closeStory]);

    const goToPreviousStory = useCallback(() => {
        // Defer the index update
        setTimeout(() => {
            setSelectedStoryIndex((prevIndex) => {
                let nextIndex = prevIndex - 1;
                while(nextIndex >= 0 && allStories[nextIndex]?.id?.startsWith('placeholder-')) {
                    nextIndex--;
                }
                if (nextIndex < 0) {
                    closeStory();
                    return prevIndex;
                }
                return nextIndex;
            });
        }, 0);
    }, [allStories, closeStory]);
    
    return (
        <>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 px-4">
                    {allStories.map((story, index) => {
                        const user = story.user;
                        const isCurrentUserStory = user.id === currentUser.id;
                        const hasActualStory = !story.id.startsWith('placeholder-');

                        return (
                            <div key={user.id} className="flex flex-col items-center space-y-1 w-16" onClick={() => openStory(index)}>
                                <div className="relative cursor-pointer">
                                    <div className={cn(
                                        "relative rounded-full p-0.5",
                                        hasActualStory && "bg-gradient-to-tr from-accent to-primary"
                                    )}>
                                        <Avatar className="h-12 w-12 border-2 border-card">
                                            <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    {isCurrentUserStory && !hasActualStory && (
                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
                                            <PlusCircle className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-medium truncate w-full text-center cursor-pointer">
                                    {isCurrentUserStory ? "Your Story" : user.name}
                                </p>
                            </div>
                        )
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>

            {isViewerOpen && allStories[selectedStoryIndex] && !allStories[selectedStoryIndex].id.startsWith('placeholder-') && (
                <StoryViewer
                    key={allStories[selectedStoryIndex].id}
                    story={allStories[selectedStoryIndex]}
                    onClose={closeStory}
                    onNext={goToNextStory}
                    onPrevious={goToPreviousStory}
                />
            )}
        </>
    );
}
