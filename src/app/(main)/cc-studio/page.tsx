'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  Video, 
  Camera, 
  PenTool, 
  Palette, 
  Music, 
  Shirt, 
  Cpu, 
  Utensils, 
  Dumbbell, 
  Plane, 
  GraduationCap,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { currentUser } from '@/lib/data';

const creatorSubjects = [
  { id: 'blogger', name: 'Blogger', icon: PenTool, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'gamer', name: 'Gamer', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'editor', name: 'Video Editor', icon: Video, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'photographer', name: 'Photographer', icon: Camera, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'artist', name: 'Digital Artist', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'musician', name: 'Musician', icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'fashion', name: 'Fashion & Beauty', icon: Shirt, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'tech', name: 'Tech Enthusiast', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'food', name: 'Food & Cooking', icon: Utensils, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  { id: 'fitness', name: 'Fitness & Health', icon: Dumbbell, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'travel', name: 'Travel Vlogger', icon: Plane, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { id: 'education', name: 'Educator', icon: GraduationCap, color: 'text-amber-700', bg: 'bg-amber-500/10' },
];

export default function CCStudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set(
    creatorSubjects
      .filter(s => currentUser.creatorSubjects?.includes(s.name))
      .map(s => s.id)
  ));

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (selectedSubjects.size === 0) {
      toast({
        title: "No subjects selected",
        description: "Please select at least one niche to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Save names to current user for profile display
    const names = creatorSubjects
      .filter(s => selectedSubjects.has(s.id))
      .map(s => s.name);
    
    currentUser.creatorSubjects = names;
    
    toast({
      title: "Creator Niche Updated",
      description: `You have selected ${selectedSubjects.size} creator subjects. These will appear on your profile.`,
    });
    router.back();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 overflow-y-auto no-scrollbar p-5">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">What kind of creator are you?</h2>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">Select the subjects that best describe your content. This helps customize your tools and shows your niche on your profile.</p>
        </div>

        <div className="flex flex-col gap-2">
          {creatorSubjects.map((subject) => {
            const isSelected = selectedSubjects.has(subject.id);
            return (
              <Card
                key={subject.id}
                className={cn(
                  "relative flex items-center p-2.5 cursor-pointer transition-all duration-200 border-2 hover:border-primary/50 group",
                  isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-card"
                )}
                onClick={() => toggleSubject(subject.id)}
              >
                <div className={cn("p-1.5 rounded-lg mr-3 shrink-0 transition-transform group-active:scale-95", subject.bg)}>
                  <subject.icon className={cn("h-5 w-5", subject.color)} />
                </div>
                <span className="font-bold text-xs flex-1">{subject.name}</span>
                
                <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/20"
                )}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />}
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="p-4 border-t bg-background">
        <Button 
          className="w-full h-11 text-sm font-bold rounded-xl shadow-md shadow-primary/10" 
          onClick={handleSave}
          disabled={selectedSubjects.size === 0}
        >
          Save Preferences
        </Button>
      </footer>
    </div>
  );
}