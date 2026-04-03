import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart3, Bell, User, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

export const TopBar: React.FC = () => {
  return (
    <header className="glass-header w-full flex justify-between items-center px-4 sm:px-6 py-2.5 sm:py-4 pt-[calc(0.625rem+var(--spacing-safe-top))]">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-primary-container flex items-center justify-center">
          <LayoutGrid className="text-primary w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        <h1 className="font-serif text-lg sm:text-2xl font-semibold tracking-tight text-primary">
          EduFlow <span className="italic font-normal">AI</span>
        </h1>
      </div>
      <button className="text-primary hover:opacity-80 transition-opacity p-1">
        <User className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Children', path: '/children' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Bell, label: 'Inbox', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-background/80 backdrop-blur-2xl border-t border-outline-variant/10 flex justify-around items-center px-2 pt-2 pb-[calc(1rem+var(--spacing-safe-bottom))] sm:pb-8 shadow-[0_-8px_30px_0_rgba(27,28,25,0.06)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center min-w-[64px] py-1.5 transition-all duration-300 relative group",
              isActive 
                ? "text-primary" 
                : "text-on-surface/40 hover:text-primary"
            )
          }
        >
          <div className={cn(
            "p-2 rounded-2xl transition-all duration-300 relative z-10",
            "group-active:scale-90",
            "aria-[current=page]:bg-primary/10"
          )}>
            <item.icon className={cn("w-6 h-6 transition-transform duration-300")} />
          </div>
          <span className="font-mono text-[8px] uppercase tracking-[0.15em] mt-1 font-bold transition-colors duration-300">
            {item.label}
          </span>
          <div className={cn(
            "absolute bottom-0 h-0.5 w-4 rounded-full bg-primary transition-all duration-500",
            "opacity-0 scale-x-0",
            "aria-[current=page]:opacity-100 aria-[current=page]:scale-x-100"
          )} />
        </NavLink>
      ))}
    </nav>
  );
};
