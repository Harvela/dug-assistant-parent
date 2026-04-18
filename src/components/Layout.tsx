import React from 'react';
import { TopBar, BottomNav } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  showTopBar?: boolean;
  showBottomNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showTopBar = true, showBottomNav = true }) => {
  return (
    <div
      className={
        showBottomNav
          ? 'min-h-screen pb-[calc(5rem+var(--spacing-safe-bottom))] sm:pb-32'
          : 'min-h-screen pb-[calc(1rem+var(--spacing-safe-bottom))]'
      }
    >
      {showTopBar && <TopBar />}
      <main className="px-4 sm:px-6 max-w-4xl mx-auto">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};
