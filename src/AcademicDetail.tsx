import React from 'react';
import { Layout } from './components/Layout';
import { useParams, Navigate } from 'react-router-dom';
import { STUDENTS } from './data';
import { AlertTriangle, TrendingDown, BarChart2, BrainCircuit, Sparkles, Calendar } from 'lucide-react';
import { cn } from './lib/utils';

export const AcademicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const student = STUDENTS.find(s => s.id === id);

  if (!student) return <Navigate to="/children" />;

  return (
    <Layout>
      <div className="space-y-10 sm:space-y-12 pt-6 sm:pt-8">
        {/* Header Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-on-surface-variant">{student.grade} • {student.section}</span>
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-on-surface">{student.name}</h1>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className={cn(
                "inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full gap-2",
                student.status === 'at-risk' ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"
              )}>
                <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest font-bold">
                  Academic: {student.status === 'at-risk' ? 'At Risk' : 'Stable'}
                </span>
              </div>
              <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant italic">Last updated: Today, 08:45 AM</span>
            </div>
          </div>
        </section>

        {/* Performance Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8">
          <div className="sm:col-span-8 bg-surface-container-lowest p-5 sm:p-10 rounded-xl editorial-shadow relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[300px]">
            <div className="relative z-10">
              <span className="font-mono text-[9px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Semester Average</span>
              <div className="flex items-baseline gap-2 sm:gap-4 mt-1 sm:mt-2">
                <h2 className="font-serif text-6xl sm:text-9xl font-bold text-primary">{student.academicStanding}<span className="text-2xl sm:text-5xl">%</span></h2>
                <div className="flex flex-col">
                  <TrendingDown className="text-error w-4 h-4 sm:w-6 sm:h-6" />
                  <span className="font-mono text-[8px] sm:text-xs text-error">-4.2%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-8 relative z-10 h-12 sm:h-24 flex items-end gap-1 sm:gap-2">
              {[0.5, 0.6, 0.75, 0.5, 0.85, 0.3].map((h, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-sm transition-all duration-500",
                    i === 4 ? "bg-primary" : i === 5 ? "bg-error/40" : "bg-primary/10"
                  )} 
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5">
              <BarChart2 className="w-[100px] h-[100px] sm:w-[200px] sm:h-[200px]" />
            </div>
          </div>
          <div className="sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-6">
            <div className="bg-surface-container-high p-4 sm:p-6 rounded-xl space-y-0.5 sm:space-y-2">
              <span className="font-mono text-[9px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Class Rank</span>
              <h3 className="font-serif text-2xl sm:text-5xl font-semibold">{student.classRank}</h3>
            </div>
            <div className="bg-secondary-container p-4 sm:p-6 rounded-xl space-y-0.5 sm:space-y-2">
              <span className="font-mono text-[9px] sm:text-xs uppercase tracking-widest text-on-secondary-container">Attendance</span>
              <h3 className="font-serif text-2xl sm:text-5xl font-semibold">{student.attendance}<span className="text-base sm:text-xl italic">%</span></h3>
            </div>
          </div>
        </section>

        {/* AI Insight */}
        <section className="bg-surface-bright border-l-4 border-tertiary p-6 sm:p-8 rounded-r-xl editorial-shadow relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-10">
            <BrainCircuit className="w-32 h-32 sm:w-48 sm:h-48 text-tertiary" />
          </div>
          <div className="flex items-start gap-4 sm:gap-6 relative z-10">
            <div className="bg-tertiary-container p-2.5 sm:p-3 rounded-full flex-shrink-0">
              <Sparkles className="text-on-tertiary-container w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h4 className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-tertiary font-bold">EduFlow AI Insight</h4>
              <p className="font-serif text-lg sm:text-xl italic text-on-surface leading-relaxed">
                "{student.name} struggles with late-afternoon sessions. Pattern suggests earlier study blocks for cognitive-heavy subjects like Mathematics."
              </p>
            </div>
          </div>
        </section>

        {/* Urgent Focus */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold">Urgent Focus</h3>
            <div className="h-px flex-1 bg-outline-variant/30"></div>
          </div>
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl editorial-shadow flex flex-col gap-6 sm:gap-8 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full items-start sm:items-center">
              <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-error-container/20 rounded-lg flex items-center justify-center">
                <span className="font-serif text-5xl sm:text-7xl font-bold text-error">D</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xl sm:text-2xl font-bold">Mathematics</h4>
                  <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant">Last assessment: {student.lastAssessmentDate}</span>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      alt={student.teacher.name} 
                      className="w-full h-full object-cover" 
                      src={student.teacher.avatar} 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold text-on-surface-variant">{student.teacher.name}</span>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      "{student.teacher.feedback}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full sm:w-auto bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Intervention
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};
