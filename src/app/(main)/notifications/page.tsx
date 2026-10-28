
'use client';

import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { users, posts, currentUser } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: "n1",
    type: "follow",
    user: users[0],
    time: "2h ago",
    read: false,
  },
  {
    id: "n2",
    type: "like",
    user: users[1],
    post: posts[2],
    time: "5h ago",
    read: false,
  },
  {
    id: "n3",
    type: "comment",
    user: users[3],
    post: posts[0],
    comment: "This is absolutely breathtaking!",
    time: "1d ago",
    read: true,
  },
  {
    id: "n4",
    type: "like",
    user: users[2],
    post: posts[1],
    time: "2d ago",
    read: true,
  },
    {
    id: "n5",
    type: "follow",
    user: users[4],
    time: "3d ago",
    read: false,
  },
  {
    id: "n6",
    type: "like",
    user: users[0],
    post: posts[4],
    time: "3d ago",
    read: true,
  },
  {
    id: "n7",
    type: "comment",
    user: users[2],
    post: posts[3],
    comment: "Love this book!",
    time: "4d ago",
    read: true,
  },
  {
    id: "n8",
    type: "like",
    user: users[3],
    post: posts[5],
    time: "5d ago",
    read: false,
  },
  {
    id: "n9",
    type: "comment",
    user: users[1],
    post: posts[0],
    comment: "I need to go there!",
    time: "5d ago",
    read: true,
  },
  {
    id: 'n10',
    type: 'like',
    user: users[4],
    post: posts[1],
    time: '6d ago',
    read: true,
  },
  {
    id: 'n11',
    type: 'comment',
    user: users[0],
    post: posts[2],
    comment: 'Looks so fun!',
    time: '6d ago',
    read: false,
  },
];


const NotificationIcon = ({ type }: { type: string }) => {
    const iconClass = "h-4 w-4 text-white";
    switch (type) {
        case 'follow':
            return (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-card">
                    <UserPlus className={iconClass} />
                </div>
            );
        case 'like':
            return (
                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-card">
                    <Heart className={iconClass} />
                </div>
            );
        case 'comment':
            return (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-card">
                    <MessageCircle className={iconClass} />
                </div>
            );
        default:
            return null;
    }
}


export default function NotificationsPage() {
  return (
    <div className="py-4">
        <div className="space-y-2">
            {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Link href={`/profile/${notification.user.id}`}>
                                <Avatar className="h-10 w-10" user={notification.user}>
                                    <AvatarImage src={notification.user.avatar.imageUrl} alt={notification.user.name} data-ai-hint={notification.user.avatar.imageHint} />
                                    <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <NotificationIcon type={notification.type} />
                        </div>
                        <p className="text-sm flex-grow">
                            <Link href={`/profile/${notification.user.id}`} className="font-semibold">{notification.user.name}</Link>
                            {notification.type === 'follow' && ' started following you.'}
                            {notification.type === 'like' && ' liked your post.'}
                            {notification.type === 'comment' && <> commented: <span className="text-muted-foreground">"{notification.comment}"</span></>}
                            <span className="text-xs text-muted-foreground ml-2">{notification.time}</span>
                        </p>
                    </div>
                    {notification.type === 'follow' ? (
                        <Button size="sm" variant="secondary" className="h-7 px-3 text-xs rounded-[8px]">Follow Back</Button>
                    ) : (
                        notification.post && (
                            <Link href={`/post/${notification.post.id}`}>
                                <div className="h-10 w-10 relative flex-shrink-0">
                                    <Image src={notification.post.image.imageUrl} alt={notification.post.image.description} fill className="object-cover rounded-sm" data-ai-hint={notification.post.image.imageHint} />
                                </div>
                            </Link>
                        )
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}
