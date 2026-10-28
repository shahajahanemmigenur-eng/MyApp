
'use client';

import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  Info,
  Users,
  LogOut,
  DollarSign,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';

const settingsSections = [
  {
    title: 'Support & About',
    items: [
      { icon: HelpCircle, label: 'Help', href: '#' },
      { icon: Info, label: 'Privacy Centre', href: '#' },
      { icon: Users, label: 'About Us', href: '#' },
      { icon: DollarSign, label: 'Monetization', href: '/monetization' },
      { icon: Code, label: 'Developer API', href: '/settings/api' },
    ],
  },
  {
    title: 'Login',
    items: [
      { icon: Users, label: 'Switch to another account', href: '/' },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push('/');
  }

  const renderSettingItem = (item: any) => {
    const buttonContent = (
      <>
        <item.icon className="h-5 w-5 text-muted-foreground" />
        <span>{item.label}</span>
      </>
    );

    if (item.href) {
        return (
            <Button
                key={item.label}
                variant="ghost"
                className="justify-start gap-3 h-12 text-base"
                asChild
            >
                <Link href={item.href}>
                  {buttonContent}
                </Link>
            </Button>
        );
    }
    
    return (
        <Button
          key={item.label}
          variant="ghost"
          className="justify-start gap-3 h-12 text-base"
        >
          {buttonContent}
        </Button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center p-3 border-b bg-card z-10 shrink-0">
        <h1 className="font-bold text-base ml-2">Settings</h1>
      </header>
      <main className="flex-1 overflow-y-auto bg-card no-scrollbar">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <div className="p-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-2">{section.title}</h2>
              <div className="flex flex-col">
                {section.items.map((item) => renderSettingItem(item))}
              </div>
            </div>
            {settingsSections.indexOf(section) < settingsSections.length - 1 && <Separator />}
          </div>
        ))}
         <div className="p-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="justify-start gap-3 h-12 text-base w-full text-destructive hover:text-destructive"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be returned to the login screen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </main>
    </div>
  );
}
