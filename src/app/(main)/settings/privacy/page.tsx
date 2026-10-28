'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Eye, UserCheck, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  const router = useRouter();

  const privacyPrinciples = [
    {
      icon: Lock,
      title: "Data Protection",
      description: "We use state-of-the-art encryption to ensure your personal information and content are stored securely and never shared without your consent."
    },
    {
      icon: Eye,
      title: "Content Control",
      description: "You have full control over who sees your posts. Switch to a private account anytime to manually approve every new follower."
    },
    {
      icon: Shield,
      title: "Secure Messaging",
      description: "Your direct messages are protected by secure layers of authentication, ensuring your conversations stay between you and your connections."
    },
    {
      icon: UserCheck,
      title: "Account Integrity",
      description: "We provide comprehensive tools to block, report, and manage unwanted interactions, maintaining a respectful environment for everyone."
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b sticky top-0 bg-background z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-bold text-base ml-2">Account Privacy</h1>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        <div className="text-center space-y-2 pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Your Privacy is Our Priority</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
            At G Post, we are committed to providing a safe and secure environment for your universe.
          </p>
        </div>

        <div className="space-y-4">
          {privacyPrinciples.map((principle, index) => (
            <Card key={index} className="border-none bg-accent/30 shadow-none rounded-2xl">
              <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                <div className="p-2 rounded-lg bg-background shadow-sm shrink-0">
                    <principle.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-bold">{principle.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-4">
            <Card className="border border-primary/20 bg-primary/5 rounded-2xl shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="text-sm font-bold">Privacy Checkup</p>
                        <p className="text-[10px] text-muted-foreground">Review your current visibility settings</p>
                    </div>
                    <Button size="sm" className="h-8 px-4 text-[10px] font-bold uppercase tracking-tight rounded-xl">Review</Button>
                </CardContent>
            </Card>
        </div>

        <div className="text-center pb-8">
            <p className="text-[10px] text-muted-foreground">
                By using G Post, you agree to our comprehensive <span className="underline font-bold text-foreground">Privacy Policy</span> and <span className="underline font-bold text-foreground">Terms of Service</span>.
            </p>
        </div>
      </main>
    </div>
  );
}
