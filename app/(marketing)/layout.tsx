import React from 'react';

import { Navbar } from '@/app/(marketing)/_components/navbar';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({
  children,
}: Readonly<MarketingLayoutProps>) {
  return (
    <div className="h-full dark:bg-[#1F1F1F]">
      <Navbar />
      <main className="h-full pt-40">{children}</main>
    </div>
  );
}
