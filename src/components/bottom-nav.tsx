"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Clapperboard, Activity, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Suspense } from 'react';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/reels', icon: Clapperboard, label: 'Reels' },
  { href: '/activity', icon: Activity, label: 'Pulse' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
];

function BottomNavContent() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-5 items-center justify-around p-2 border-t bg-card shrink-0">
      <TooltipProvider>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          const NavContent = (
            <Link href={item.href}>
                <item.icon
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="sr-only">{item.label}</span>
            </Link>
          );

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-md h-12 w-12',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {NavContent}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </nav>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={<div className="h-16 border-t bg-card" />}>
      <BottomNavContent />
    </Suspense>
  );
}
