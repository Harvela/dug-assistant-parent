import React from 'react';
import { Layout } from './components/Layout';
import { STUDENTS } from './data';
import { ChevronRight, GraduationCap, Banknote, ShieldCheck, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from './lib/utils';

export const ChildrenList: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8 sm:space-y-10 pt-6 sm:pt-8">
        {/* Editorial Header */}
        <div className="mb-8 sm:mb-12">
          <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-2">Student Dossiers</p>
          <h2 className="serif-display text-3xl sm:text-4xl font-medium tracking-tight text-on-surface">Children</h2>
          <div className="h-0.5 w-10 sm:w-12 bg-primary mt-3 sm:mt-4"></div>
        </div>

        {/* List Section */}
        <div className="space-y-4 sm:space-y-10">
          {STUDENTS.map((student) => (
            <Link 
              key={student.id} 
              to={`/student/${student.id}`}
              className="group relative block bg-surface-container-lowest p-4 sm:p-8 rounded-xl editorial-shadow hover:shadow-[0_8px_30px_0_rgba(27,28,25,0.08)] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-surface-container-high">
                      <img 
                        alt={student.name} 
                        className="w-full h-full object-cover" 
                        src={student.avatar} 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full font-mono text-[7px] sm:text-[9px] uppercase font-bold",
                      student.status === 'at-risk' ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"
                    )}>
                      {student.status === 'at-risk' ? 'AT RISK' : 'ACTIVE'}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-2xl text-on-surface group-hover:text-primary transition-colors">{student.name}</h3>
                    <p className="font-mono text-[9px] sm:text-xs text-on-surface-variant mt-0.5 sm:mt-1 uppercase tracking-wider">{student.grade} • {student.section}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 border-t sm:border-t-0 border-outline-variant/10 pt-3 sm:pt-0">
                  <div className="flex items-center sm:flex-col gap-1.5 sm:gap-1">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                    <span className="font-mono text-[8px] sm:text-[10px] uppercase text-on-surface-variant">Academic</span>
                  </div>
                  <div className="flex items-center sm:flex-col gap-1.5 sm:gap-1">
                    <Banknote className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-tertiary" />
                    <span className="font-mono text-[8px] sm:text-[10px] uppercase text-on-surface-variant">Finance</span>
                  </div>
                  <Link to={`/behavior/${student.id}`} className="flex items-center sm:flex-col gap-1.5 sm:gap-1 hover:text-primary transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-secondary" />
                    <span className="font-mono text-[8px] sm:text-[10px] uppercase text-on-surface-variant">Behavior</span>
                  </Link>
                  <div className="hidden sm:block ml-4">
                    <ChevronRight className="text-outline-variant group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}
        </div>

        {/* AI Curator Insight Widget */}
        <div className="mt-16 bg-surface-container-low p-6 rounded-xl border-l-4 border-tertiary">
          <div className="flex items-start gap-4">
            <BrainCircuit className="text-tertiary w-6 h-6 mt-1" />
            <div>
              <h4 className="font-mono text-xs font-bold uppercase text-tertiary tracking-widest mb-2">Curator Insight</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Sofia has shown a <span className="text-primary font-bold">12% increase</span> in mathematics engagement this week. Leo's foundation reports are now fully compiled and ready for review in the Reports section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
