'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from "date-fns"
import { Calendar as CalendarIcon, Link as LinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { currentUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth) : undefined);

  const handleSaveChanges = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
    router.back();
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto bg-card p-4 no-scrollbar">
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="items-center pb-8">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="link" className="text-primary font-bold">Change Profile Photo</Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
                    <Input id="name" defaultValue={currentUser.name} className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-12" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</Label>
                    <Input id="username" defaultValue={currentUser.id} className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-12" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio</Label>
                    <Textarea 
                      id="bio" 
                      defaultValue={currentUser.bio} 
                      className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary min-h-[100px] resize-none" 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="website" 
                        type="url" 
                        placeholder="https://example.com"
                        defaultValue={currentUser.website} 
                        className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-12 pl-10" 
                      />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal h-12 bg-muted/30 border-none hover:bg-muted/50",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 pt-6">
                 <Button className="w-full h-12 font-bold text-base rounded-full shadow-lg shadow-primary/20" onClick={handleSaveChanges}>Save Changes</Button>
                 <Button variant="ghost" className="w-full h-12 font-bold text-muted-foreground" onClick={() => router.back()}>Cancel</Button>
            </CardFooter>
        </Card>
      </main>
    </div>
  );
}
