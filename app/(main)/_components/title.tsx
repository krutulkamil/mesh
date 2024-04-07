'use client';

import React, { useState, useRef } from 'react';
import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Doc } from '@/convex/_generated/dataModel';

interface TitleProps {
  initialData: Doc<'documents'>;
}

export function Title({ initialData }: Readonly<TitleProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useMutation(api.documents.update);

  const [title, setTitle] = useState(initialData.title || 'Untitled');
  const [isEditing, setIsEditing] = useState(false);

  function enableInput() {
    setTitle(initialData.title);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, title.length);
    }, 0);
  }

  function disableInput() {
    setIsEditing(false);
  }

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
    await update({
      id: initialData._id,
      title: event.target.value || 'Untitled',
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      disableInput();
    }
  }

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={disableInput}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1"
        >
          <span className="truncate">{initialData?.title}</span>
        </Button>
      )}
    </div>
  );
}

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-9 w-20 rounded-md" />;
};
