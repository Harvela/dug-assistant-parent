import React from 'react';
import { Layout } from './components/Layout';
import { ChevronRight, GraduationCap, Banknote, ShieldCheck, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from './lib/utils';
import {
  useParentChildren,
  useParentAnalysisOverview,
} from './hooks/parentQueries';
import { DEFAULT_AVATAR } from './data';
import { useTranslation } from 'react-i18next';

export const ChildrenList: React.FC = () => {
  const { t } = useTranslation();
  const { data: children, isLoading, error } = useParentChildren();
  const { data: overview } = useParentAnalysisOverview();
  const byStudent = new Map((overview?.items ?? []).map((i) => [i.studentId, i]));
  const curator =
    overview?.summary ??
    'Generate a report from the student profile to see AI insights here.';

  return (
    <Layout>
      <div className="space-y-8 sm:space-y-10 pt-6 sm:pt-8">
        <div className="mb-8 sm:mb-12">
          <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-2">Student Dossiers</p>
          <h2 className="serif-display text-3xl sm:text-4xl font-medium tracking-tight text-on-surface">
            {t('children.title', { defaultValue: 'Children' })}
          </h2>
          <div className="h-0.5 w-10 sm:w-12 bg-primary mt-3 sm:mt-4"></div>
        </div>

        {isLoading ? (
          <p className="font-mono text-sm text-on-surface-variant">
            {t('common.loading', { defaultValue: 'Loading…' })}
          </p>
        ) : error ? (
          <p className="text-error text-sm font-mono">
            {(error as Error).message ?? 'Could not load children'}
          </p>
        ) : !children?.length ? (
          <p className="text-on-surface-variant">
            {t('children.noChildren', { defaultValue: 'No children linked yet.' })}
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-10">
            {children.map((student) => {
              const ov = byStudent.get(student.id);
              const sev = ov?.severity ?? 'ok';
              const statusUi =
                student.status !== 'Active' || student.feesStatus === 'Unpaid'
                  ? 'at-risk'
                  : 'active';
              const avatar = student.photo || DEFAULT_AVATAR;
              const grade = student.gradeName ?? '—';
              const section = student.className ?? '—';
              return (
                <Link
                  key={student.id}
                  to={`/reports/child/${student.id}`}
                  className="group relative block bg-surface-container-lowest p-4 sm:p-8 rounded-xl editorial-shadow hover:shadow-[0_8px_30px_0_rgba(27,28,25,0.08)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex  gap-3 sm:gap-6">
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-surface-container-high">
                          {student.photo ? (
                            <img
                              alt={student.name}
                              className="w-full h-full object-cover"
                              src={student.photo}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface/30 font-serif text-2xl">
                              {student.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg sm:text-2xl text-on-surface group-hover:text-primary transition-colors">
                          {student.name}
                        </h3>
                        <p className="font-mono text-[9px] sm:text-xs text-on-surface-variant mt-0.5 sm:mt-1 uppercase tracking-wider">
                          {grade} • {section}
                        </p>
                        {ov?.topActions?.[0] ? (
                          <p className="mt-2 text-sm text-on-surface/70 line-clamp-2">
                            {ov.topActions[0]}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {/* <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 border-t sm:border-t-0 border-outline-variant/10 pt-3 sm:pt-0">
                      <div className="flex items-center sm:flex-col gap-1.5 sm:gap-1">
                        <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                        <span className="font-mono text-[8px] sm:text-[10px] uppercase text-on-surface-variant">Academic</span>
                      </div>
                      <div className="flex items-center sm:flex-col gap-1.5 sm:gap-1">
                        <Banknote className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-tertiary" />
                        <span className="font-mono text-[8px] sm:text-[10px] uppercase text-on-surface-variant">Finance</span>
                      </div>
                      <Link
                        to={`/behavior/${student.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center sm:flex-col gap-1.5 sm:gap-1 hover:text-primary transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-secondary" />
                        <span className="font-mono text-[8px] sm:text-[10px] uppercase text-on-surface-variant">Behavior</span>
                      </Link>
                      <div className="hidden sm:block ml-4">
                        <ChevronRight className="text-outline-variant group-hover:text-primary transition-colors" />
                      </div>
                    </div> */}
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
