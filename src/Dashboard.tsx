import React from 'react';
import { Layout } from './components/Layout';
import { AlertTriangle, Clock, TrendingUp, GraduationCap, Wallet, Smile, Sparkles, BookOpen } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8 sm:space-y-10 pt-6 sm:pt-8">
        {/* Welcome Greeting */}
        <section className="space-y-1">
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/70">Welcome back</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Good morning, Mr. Rodriguez</h2>
        </section>

        {/* Priority Focus */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-serif text-lg sm:text-xl font-semibold">Priority Focus</h3>
            <span className="font-mono text-[9px] sm:text-[10px] uppercase text-tertiary">2 Urgent Tasks</span>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl flex gap-3 sm:gap-4 relative overflow-hidden group editorial-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
              <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-error-container text-on-error-container">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-error font-bold">Academic Risk</span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-on-surface-variant">Today</span>
                </div>
                <p className="text-on-surface text-sm sm:text-base font-medium mt-0.5 sm:mt-1">At risk in Math (84% probability)</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl flex gap-3 sm:gap-4 relative overflow-hidden group editorial-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
              <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-tertiary-container text-on-tertiary-container">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-tertiary font-bold">Incomplete</span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-on-surface-variant">Due 2h ago</span>
                </div>
                <p className="text-on-surface text-sm sm:text-base font-medium mt-0.5 sm:mt-1">3 missing Physics assignments</p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary Widgets */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="col-span-2 bg-surface-container-low p-5 sm:p-6 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-surface-container transition-colors">
            <div className="space-y-1">
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-primary">Academic Standing</span>
              <h4 className="font-serif text-2xl sm:text-3xl font-semibold">88% <span className="text-base sm:text-lg font-mono font-normal opacity-50">/ A-</span></h4>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 academic-gradient rounded-full flex items-center justify-center text-white shadow-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl space-y-2 sm:space-y-3 editorial-shadow">
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-outline" />
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest">Finance</span>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-xl sm:text-2xl font-serif font-bold">Good</p>
              <p className="font-mono text-[9px] sm:text-[10px] text-on-surface-variant">No pending dues</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl space-y-2 sm:space-y-3 editorial-shadow">
            <div className="flex items-center gap-2">
              <Smile className="w-3.5 h-3.5 text-outline" />
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest">Behavior</span>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-xl sm:text-2xl font-serif font-bold">94 <span className="text-[10px] sm:text-xs font-mono font-normal opacity-50">PTS</span></p>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[94%]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Curated Insight */}
        <section className="space-y-4">
          <h3 className="font-serif text-xl font-semibold">AI Curated Insight</h3>
          <div className="relative bg-surface-container-high rounded-xl p-6 overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary-container/30 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container px-3 py-1 rounded-full">
                  <span className="font-mono text-[10px] uppercase font-semibold text-on-secondary-container">Intelligence Flow</span>
                </div>
              </div>
              <p className="font-serif text-xl text-on-surface italic leading-relaxed">
                "Based on recent test patterns, reviewing Algebra concepts this weekend will significantly boost Sofia's confidence for Tuesday's midterm."
              </p>
              <div className="flex items-center justify-between pt-2">
                <button className="bg-primary text-white font-mono text-[11px] uppercase tracking-widest px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition-opacity">
                  View Study Plan
                </button>
                <Sparkles className="text-primary w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Student Life */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-grow bg-outline-variant/30"></div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">Student Life</span>
            <div className="h-px flex-grow bg-outline-variant/30"></div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-surface-container-low">
            <div className="aspect-[16/9] w-full">
              <img 
                alt="School Environment" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-2">
              <h4 className="font-serif text-lg font-semibold">Upcoming Parent-Teacher Workshop</h4>
              <p className="text-sm text-on-surface-variant leading-snug">Join us for a digital wellness seminar next Wednesday in the Grand Archive.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
