
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import type { User } from "@/lib/data";

interface ProfilePictureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  children: React.ReactNode;
}

export function ProfilePictureDialog({ open, onOpenChange, user, children }: ProfilePictureDialogProps) {
  if (!user) return <>{children}</>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <div onClick={(e) => e.preventDefault()}>{children}</div>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] w-auto">
          <DialogHeader>
            <DialogTitle>
              <VisuallyHidden>Profile Picture</VisuallyHidden>
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-square w-[80vw] max-w-[400px] h-auto">
            <Avatar className="w-full h-full">
                <AvatarImage src={user.avatar.imageUrl} alt={user.name} className="object-cover"/>
                <AvatarFallback className="text-6xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <DialogFooter className="justify-center p-4 bg-transparent sm:justify-center">
            <Button asChild>
                <Link href={`/profile/${user.id}`}>View Profile</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
