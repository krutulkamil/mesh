'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useConvexAuth } from 'convex/react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/spinner';

export function Heading() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Your Ideas, Documents & Plans. Unified. Welcome to{' '}
        <span className="underline">Mesh</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Mesh is the connected workspace where better, faster work happens.
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button>
          Enter Mesh
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
