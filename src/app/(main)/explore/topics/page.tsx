
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { pulseTopics } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TopicsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('pulse:selected-topics');
    if (saved) {
      try {
        setSelectedTopics(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse selected topics in topics page:", e);
        setSelectedTopics([]);
      }
    }
  }, []);

  const filteredTopics = pulseTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTopicSelect = (topicTitle: string) => {
    // Notify the global header about the selection
    window.dispatchEvent(new CustomEvent('sociverse:topic-selected', { detail: topicTitle }));
    
    const isSelected = selectedTopics.includes(topicTitle);
    setSelectedTopics(prev => {
        const next = isSelected ? prev.filter(t => t !== topicTitle) : [...prev, topicTitle];
        return next;
    });

    toast({
      title: isSelected ? "Removed Topic" : "Added Topic",
      description: isSelected ? `No longer following ${topicTitle}` : `Now following ${topicTitle}`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-accent/5">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search all topics..." 
                    className="pl-9 h-11 bg-background border-none shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">All Categories</h2>
                    </div>
                    {selectedTopics.length > 0 && (
                        <span className="text-[10px] font-bold text-primary uppercase">{selectedTopics.length} selected</span>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    {filteredTopics.map((topic) => {
                        const isSelected = selectedTopics.includes(topic.title);
                        return (
                            <div 
                                key={topic.title} 
                                onClick={() => handleTopicSelect(topic.title)}
                                className={cn(
                                    "p-4 rounded-xl transition-all cursor-pointer group active:scale-[0.99] flex items-center justify-between",
                                    isSelected ? "bg-primary/5 border border-primary/10 shadow-sm" : "hover:bg-primary/5"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-bold transition-colors leading-tight",
                                    isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                                )}>
                                    {topic.title}
                                </span>
                                {isSelected && (
                                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50 duration-200">
                                        <Check className="h-3 w-3 text-primary-foreground stroke-[4]" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {filteredTopics.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No topics found for "{searchTerm}"</p>
                    </div>
                )}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
