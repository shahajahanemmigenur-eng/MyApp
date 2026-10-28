
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/auth/login-page';
import { LoaderCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      router.replace('/home');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <LoginPage />;
}
