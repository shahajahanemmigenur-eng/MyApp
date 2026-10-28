
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { useRouter } from 'next/navigation'

import { cn } from "@/lib/utils"
import type { User } from "@/lib/data"
import { ProfilePictureDialog } from "../profile-picture-dialog"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { 
    user?: User,
    onStoryOpen?: () => void,
  }
>(({ className, user, onStoryOpen, ...props }, ref) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    pressTimer.current = setTimeout(() => {
      if (user) {
        setIsDialogOpen(true);
        pressTimer.current = null;
      }
    }, 500); // 500ms for long press
  };

  const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      // This was a click, not a long press
      if (user && onStoryOpen) {
          onStoryOpen();
      } else if (user) {
          router.push(`/profile/${user.id}`);
      }
    }
  };
  
  const avatarElement = (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onTouchStart={(e) => handleInteractionStart(e as any)}
      onTouchEnd={(e) => handleInteractionEnd(e as any)}
      {...props}
    />
  );
  
  if (user) {
    return (
      <ProfilePictureDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} user={user}>
        {avatarElement}
      </ProfilePictureDialog>
    )
  }

  return avatarElement;
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
