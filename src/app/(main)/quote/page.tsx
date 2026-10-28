
'use client';

import { Suspense } from 'react';
import { QuotePostComposer } from '@/components/quote-post-composer';
import { LoaderCircle } from 'lucide-react';

/**
 * @fileOverview Dedicated page for quoting posts or reels using the premium 2026 composer.
 */

export default function QuotePostPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full bg-black">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <QuotePostComposer />
    </Suspense>
  );
}
