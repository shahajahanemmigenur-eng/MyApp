'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser } from '@/lib/data';
import { LoaderCircle } from 'lucide-react';

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.id) {
      router.replace(`/profile/${currentUser.id}`);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
