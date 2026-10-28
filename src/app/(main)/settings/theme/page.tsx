
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ChevronLeft, Sun, Moon, Laptop } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
];

export default function ThemePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast({
      title: 'Theme Updated',
      description: `Your theme has been set to ${newTheme}.`,
    });
  };

  // The 'theme' from useTheme can be undefined initially, so we need to handle it.
  const currentTheme = theme as Theme || 'system';

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center p-3 border-b bg-card z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-bold text-base ml-2">Change Theme</h1>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Card className="m-0 border-none shadow-none rounded-none">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose how SociVerse looks on your device. Select a theme or sync with your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={currentTheme} 
              onValueChange={(value) => handleThemeChange(value as Theme)} 
              className="gap-4"
            >
              {themeOptions.map((option) => (
                <Label 
                  key={option.value} 
                  htmlFor={option.value}
                  className={cn(
                    "flex items-center space-x-4 rounded-md p-4 transition-colors cursor-pointer",
                    "border-transparent hover:bg-accent/50",
                    currentTheme === option.value && "bg-accent border-primary"
                  )}
                >
                  <option.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-semibold capitalize">{option.label}</div>
                  </div>
                  <RadioGroupItem value={option.value} id={option.value} className="h-5 w-5"/>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
