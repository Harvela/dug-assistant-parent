import React from 'react';
import { TopBar, BottomNav } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen pb-[calc(5rem+var(--spacing-safe-bottom))] sm:pb-32">
      <TopBar />
      <main className="px-4 sm:px-6 max-w-4xl mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
