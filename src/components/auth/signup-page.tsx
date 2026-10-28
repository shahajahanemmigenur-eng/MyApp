
"use client";

import Link from 'next/link';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SignupPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            G Post
          </CardTitle>
          <CardDescription>
            Create an account to join your universe
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" required />
          </div>
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
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="flex gap-2">
              <Select defaultValue="+1">
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                  <SelectItem value="+91">+91</SelectItem>
                  <SelectItem value="+61">+61</SelectItem>
                </SelectContent>
              </Select>
              <Input id="mobile" type="tel" placeholder="555-123-4567" required className="flex-1" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/home">Sign Up</Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/"
              className="underline text-primary/90 hover:text-primary"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
