import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart3, Bell, User, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { readLangFromStorage, writeLangToStorage } from '../lib/i18n/lang';

export const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const current = readLangFromStorage() ?? (i18n.language === 'en' ? 'en' : 'fr');
  return (
    <header className="glass-header w-full flex justify-between items-center mt-4 px-4 sm:px-6 py-2.5 sm:py-4 pt-[calc(0.625rem+var(--spacing-safe-top))]">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="h-5  overflow-hidden flex items-center justify-center">
          <img
            src="/logo.png"
            alt={t('app.name', { defaultValue: 'Dug assistant' })}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="font-serif text-lg sm:text-2xl font-semibold tracking-tight text-primary">
          {t('app.name', { defaultValue: 'Dug assistant' })}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-primary hover:opacity-80 transition-opacity px-2 py-1 font-mono text-[10px] uppercase tracking-widest border border-outline-variant/20 bg-white/40"
          onClick={() => {
            const next = current === 'fr' ? 'en' : 'fr';
            writeLangToStorage(next);
            void i18n.changeLanguage(next);
          }}
          aria-label="Toggle language"
        >
          {current.toUpperCase()}
        </button>
        <button className="text-primary hover:opacity-80 transition-opacity p-1" type="button">
          <User className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const navItems = [
    { icon: Home, label: t('nav.home', { defaultValue: 'Home' }), path: '/' },
    { icon: Users, label: t('nav.children', { defaultValue: 'Children' }), path: '/children' },
    { icon: BarChart3, label: t('nav.reports', { defaultValue: 'Reports' }), path: '/reports' },
    { icon: Bell, label: t('nav.inbox', { defaultValue: 'Inbox' }), path: '/notifications' },
    // { icon: User, label: 'Profile', path: '/profile' },
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
