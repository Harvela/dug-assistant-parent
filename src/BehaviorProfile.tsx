import React from 'react';
import { Layout } from './components/Layout';
import { useParams, Navigate } from 'react-router-dom';
import { STUDENTS, INCIDENTS } from './data';
import { TrendingUp, BrainCircuit, Calendar, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

export const BehaviorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const student = STUDENTS.find(s => s.id === id);

  if (!student) return <Navigate to="/children" />;

  return (
    <Layout>
      <div className="space-y-10 sm:space-y-12 pt-6 sm:pt-8">
        {/* Hero Header Section */}
        <section className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-end">
          <div className="sm:col-span-8">
            <span className="font-mono text-[10px] sm:text-sm tracking-widest text-primary uppercase mb-2 block">Student Behavior Profile</span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-on-surface">{student.name}</h2>
            <p className="font-sans text-on-surface-variant mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl leading-relaxed">
              Academic Year 2024/25. A comprehensive overview of social development, classroom engagement, and incident tracking powered by EduFlow AI.
            </p>
          </div>
          <div className="sm:col-span-4 flex justify-start sm:justify-end">
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl editorial-shadow border-b-2 border-primary w-full max-w-xs text-center">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-tighter text-on-surface-variant block mb-1 sm:mb-2">Aggregate Score</span>
              <div className="font-serif text-5xl sm:text-6xl font-bold text-primary">{student.behaviorScore}<span className="text-xl sm:text-2xl text-outline">/10</span></div>
              <div className="flex items-center justify-center gap-1 mt-1 sm:mt-2 text-secondary">
                <TrendingUp className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="font-mono text-[10px] sm:text-xs">STABLE TREND</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pattern Detection & AI Insights */}
        <section className="grid grid-cols-1 lg:grid-cols-11 gap-6">
          <div className="lg:col-span-7 bg-secondary-container rounded-xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-3xl"></div>
            <div>
              <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-full mb-4 sm:mb-6">
                <BrainCircuit className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                <span className="font-mono text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-wider">EduFlow Intelligence</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-on-primary-container leading-tight">
                "Increase in positive participation since peer-led workshops."
              </h3>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="bg-surface-container-lowest/60 backdrop-blur-md p-3 sm:p-4 rounded-lg flex-1">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase text-on-surface-variant block mb-0.5 sm:mb-1">Key Driver</span>
                <span className="font-sans font-semibold text-xs sm:text-sm">Collaborative Learning</span>
              </div>
              <div className="bg-surface-container-lowest/60 backdrop-blur-md p-3 sm:p-4 rounded-lg flex-1">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase text-on-surface-variant block mb-0.5 sm:mb-1">Impact Radius</span>
                <span className="font-sans font-semibold text-xs sm:text-sm">Humanities & Arts</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 bg-surface-container-high rounded-xl p-6 sm:p-8 border-l-4 border-tertiary flex flex-col justify-between">
            <div>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-tertiary font-bold mb-3 sm:mb-4 block">Recommended Action</span>
              <p className="font-serif text-xl sm:text-2xl text-on-surface-variant italic">"Request monthly sync with Year Lead."</p>
            </div>
            <button className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-primary to-primary-container text-white font-mono text-[10px] sm:text-xs uppercase tracking-widest py-3 sm:py-4 rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Meeting
            </button>
          </div>
        </section>

        {/* Incident Log & Trend Analysis */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div>
              <h4 className="font-serif text-2xl font-bold mb-1">Incident Log</h4>
              <div className="h-1 w-10 sm:w-12 bg-primary mb-4 sm:mb-6"></div>
            </div>
            <div className="relative space-y-10 sm:space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[1px] before:bg-outline-variant/30">
              {INCIDENTS.map((incident) => (
                <div key={incident.id} className="relative pl-10">
                  <div className={cn(
                    "absolute left-0 top-1 w-6 h-6 bg-surface-container-lowest rounded-full border flex items-center justify-center z-10",
                    incident.severity === 'minor' ? "border-primary" : "border-outline-variant/30"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      incident.severity === 'minor' ? "bg-primary" : "bg-outline-variant/30"
                    )}></div>
                  </div>
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                    <span className="font-mono text-[10px] sm:text-xs text-outline tracking-wider">{incident.date}</span>
                    <span className={cn(
                      "px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-mono font-bold uppercase",
                      incident.severity === 'minor' ? "bg-error-container text-on-error-container" : "bg-surface-container-highest text-on-surface-variant"
                    )}>
                      {incident.severity}
                    </span>
                  </div>
                  <h5 className="font-sans font-bold text-base sm:text-lg text-on-surface">{incident.title}</h5>
                  <p className="font-sans text-on-surface-variant text-xs sm:text-sm mt-1">{incident.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-xl p-6 sm:p-8 flex flex-col h-full">
              <div className="flex justify-between items-end mb-8 sm:mb-10">
                <div>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold">Behavioral Velocity</h4>
                  <p className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wide">Trailing 90-Day Analysis</p>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary"></div>
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-outline-variant/30"></div>
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-outline-variant/30"></div>
                </div>
              </div>
              <div className="flex-1 flex items-end gap-2 sm:gap-3 h-36 sm:h-48 px-1 sm:px-2 border-b border-outline-variant/20">
                {[0.6, 0.65, 0.55, 0.75, 0.82, 0.85].map((h, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 rounded-t-sm transition-all duration-300",
                      i === 5 ? "bg-primary" : i >= 3 ? "bg-primary/40 hover:bg-primary/60" : "bg-surface-container-high hover:bg-primary/20"
                    )} 
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-lg editorial-shadow">
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase text-on-surface-variant block mb-0.5 sm:mb-1">Consistency</span>
                  <span className="font-sans font-bold text-lg sm:text-xl">High (92%)</span>
                </div>
                <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-lg editorial-shadow">
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase text-on-surface-variant block mb-0.5 sm:mb-1">Peer Ranking</span>
                  <span className="font-sans font-bold text-lg sm:text-xl">Top 15th Pct</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
