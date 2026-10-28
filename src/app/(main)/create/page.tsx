
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePost } from '@/components/create-post';

export default function CreatePostPage() {
  const router = useRouter();

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-xl font-bold">Create New Post</h1>
      </div>
      <CreatePost />
    </div>
  );
}
