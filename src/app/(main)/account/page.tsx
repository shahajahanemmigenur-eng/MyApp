'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserCircle,
  Users,
  Shield,
  UserX,
  RefreshCcw,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const accountOptions = [
  { icon: UserCircle, label: 'Account Center', href: '/profile/edit' },
  { icon: Users, label: 'Account Type', href: '/settings/account-type' },
  { icon: DollarSign, label: 'Monetization', href: '/monetization' },
  { icon: Shield, label: 'Account Privacy', href: '/settings/privacy' },
  { icon: UserX, label: 'Blocked', href: '/settings/blocked' },
];

export default function AccountPage() {
  const { toast } = useToast();

  const handleRestartContent = () => {
    toast({
      title: "Restarting Universe",
      description: "Refreshing all content and preferences...",
    });

    // Hard reload to refresh the content of all pages immediately
    setTimeout(() => {
        window.location.reload();
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <main className="flex-1 p-3 space-y-2">
        <div className="grid gap-1">
          {accountOptions.map((option) => (
            <Link key={option.label} href={option.href}>
              <Card className="flex items-center justify-between p-2.5 hover:bg-accent transition-colors cursor-pointer border-none shadow-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <option.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-sm">{option.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}

          <Card 
            className="flex items-center justify-between p-2.5 hover:bg-accent transition-colors cursor-pointer border-none shadow-none"
            onClick={handleRestartContent}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <RefreshCcw className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-sm">Restart Content</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        </div>
      </main>
    </div>
  );
}
