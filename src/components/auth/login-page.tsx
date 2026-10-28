
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    router.push('/home');
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            G Post
          </CardTitle>
          <CardDescription>
            Sign in to connect with your universe
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
            <Link
                href="#"
                className="text-sm text-right underline"
              >
                Forgot your password?
              </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleLogin}>Login</Button>
          <div className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="underline text-primary/90 hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
