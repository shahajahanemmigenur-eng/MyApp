
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Code, Database, Sparkles, Terminal, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const apiSections = [
  {
    title: 'Server Actions',
    icon: Zap,
    color: 'text-yellow-500',
    items: [
      {
        name: 'getHashtagSuggestions',
        description: 'Fetches AI-powered trending hashtags based on post content.',
        params: '(postContent: string, hashtagPurpose?: string)',
        returns: 'Promise<SuggestTrendingHashtagsOutput>',
      }
    ]
  },
  {
    title: 'AI Flows (Genkit)',
    icon: Sparkles,
    color: 'text-purple-500',
    items: [
      {
        name: 'suggestTrendingHashtags',
        description: 'The underlying Genkit flow that processes natural language to extract trends.',
        model: 'gemini-2.5-flash',
        input: 'SuggestTrendingHashtagsInput',
      }
    ]
  },
  {
    title: 'Data Entities',
    icon: Database,
    color: 'text-blue-500',
    items: [
      { name: 'UserProfile', description: 'Represents a user identity, connections, and account tier.' },
      { name: 'Post', description: 'Core content entity supporting media, captions, and quotes.' },
      { name: 'Reel', description: 'Short-form video content with engagement metrics.' },
      { name: 'Comment', description: 'Recursive interaction entity supporting replies and media.' }
    ]
  },
  {
    title: 'Public Pulse API',
    icon: Activity,
    color: 'text-green-500',
    items: [
      { path: '/explore/[tag]', method: 'GET', description: 'Retrieve trending content for a specific universe topic.' },
      { path: '/activity', method: 'GET', description: 'Stream global trending pulse data.' }
    ]
  }
];

export default function ApiReferencePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b bg-card z-10 shrink-0 sticky top-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h1 className="text-base font-bold uppercase tracking-tight">API Reference</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 bg-primary/5 border-b space-y-2">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary text-primary-foreground border-none text-[9px] font-bold">STABLE</Badge>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">v1.0.0 Interface</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Developer tools for interacting with the G Post universe. Use these endpoints and actions to extend functionality or build integrated experiences.
            </p>
        </div>

        <div className="p-4 space-y-6">
          {apiSections.map((section) => (
            <section key={section.title} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <section.icon className={cn("h-4 w-4", section.color)} />
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{section.title}</h2>
              </div>
              
              <div className="grid gap-3">
                {section.items.map((item: any) => (
                  <Card key={item.name || item.path} className="border bg-card shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">
                          {item.name || item.path}
                        </code>
                        {item.method && <Badge variant="secondary" className="text-[9px] font-bold">{item.method}</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                      {item.params && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground opacity-50">Parameters</span>
                            <code className="text-[10px] font-mono bg-muted p-1.5 rounded-lg block overflow-x-auto whitespace-nowrap">{item.params}</code>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="p-8 text-center space-y-4">
            <div className="flex justify-center">
                <ShieldCheck className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium max-w-[200px] mx-auto">
                Authentication and rate limiting are applied to all API interactions. Refer to the security center for token management.
            </p>
        </div>
      </main>
    </div>
  );
}

import { cn } from '@/lib/utils';
