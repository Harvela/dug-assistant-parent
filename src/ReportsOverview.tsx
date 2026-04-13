import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import { Layout } from './components/Layout';
import { cn } from './lib/utils';
import { useParentAnalysisOverview } from './hooks/parentQueries';

function sevUi(sev: 'ok' | 'watch' | 'urgent') {
  if (sev === 'urgent') {
    return {
      icon: AlertTriangle,
      label: 'Urgent',
      pill: 'bg-error-container text-on-error-container',
      bar: 'bg-error',
    };
  }
  if (sev === 'watch') {
    return {
      icon: Eye,
      label: 'Watch',
      pill: 'bg-tertiary-container text-on-tertiary-container',
      bar: 'bg-tertiary',
    };
  }
  return {
    icon: CheckCircle2,
    label: 'OK',
    pill: 'bg-secondary-container text-on-secondary-container',
    bar: 'bg-secondary',
  };
}

export const ReportsOverview: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useParentAnalysisOverview();

  return (
    <Layout>
      <div className="space-y-8 sm:space-y-10 pt-6 sm:pt-8">
        <div className="mb-8 sm:mb-12">
          <h2 className="serif-display text-3xl sm:text-4xl font-medium tracking-tight text-on-surface">
            {t('nav.reports', { defaultValue: 'Reports' })}
          </h2>
          <div className="h-0.5 w-10 sm:w-12 bg-primary mt-3 sm:mt-4"></div>
        </div>

        {isLoading ? (
          <p className="font-mono text-sm text-on-surface-variant">
            {t('common.loading', { defaultValue: 'Loading…' })}
          </p>
        ) : error ? (
          <p className="text-error text-sm font-mono">
            {t('common.errorGeneric', { defaultValue: 'Something went wrong' })}
          </p>
        ) : data ? (
          <>
            <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl editorial-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface/50">
                    {t('dashboard.fromYourData', { defaultValue: 'From your data' })}
                  </div>
                  <p className="mt-2 text-base font-bold text-on-surface leading-snug">
                    {data.summary}
                  </p>
                  {data.updatedAt && (
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-on-surface">
                      {t('common.updatedAt', {
                        defaultValue: 'Updated {{date}}',
                        date: new Date(data.updatedAt).toLocaleString(),
                      })}
                    </div>
                  )}
                </div>
                
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {data.urgentCount > 0 && (
                  <span className="px-2 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest bg-error-container text-on-error-container">
                    {data.urgentCount} urgent
                  </span>
                )}
                {data.watchCount > 0 && (
                  <span className="px-2 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container">
                    {data.watchCount} watch
                  </span>
                )}
                {data.urgentCount === 0 && data.watchCount === 0 && (
                  <span className="px-2 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container">
                    stable
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg sm:text-xl font-semibold">
                  {t('children.title', { defaultValue: 'Children' })}
                </h3>
                <Link
                  to="/children"
                  className="font-mono text-[10px] uppercase tracking-widest text-primary hover:opacity-80"
                >
                  {t('common.viewChildren', { defaultValue: 'View children' })}
                </Link>
              </div>

              <div className="space-y-3">
                {data.items.map((it) => {
                  const ui = sevUi(it.severity);
                  const Icon = ui.icon;
                  const topWeak = it.weakSubjects[0]?.subject;
                  const hint =
                    it.severity === 'urgent'
                      ? topWeak
                        ? `Focus: ${topWeak}`
                        : 'Needs attention'
                      : it.severity === 'watch'
                        ? topWeak
                          ? `Watch: ${topWeak}`
                          : 'Watch'
                        : 'Stable';

                  return (
                    <Link
                      key={it.studentId}
                      to={`/reports/child/${it.studentId}`}
                      className="group relative block bg-surface-container-lowest p-4 sm:p-6 rounded-xl editorial-shadow hover:shadow-[0_8px_30px_0_rgba(27,28,25,0.08)] transition-all"
                    >
                      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', ui.bar)} />
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-on-surface/60" />
                            <span className={cn('px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest', ui.pill)}>
                              {ui.label}
                            </span>
                          </div>
                          <div className="mt-2 font-serif text-xl text-on-surface truncate">
                            {it.studentName}
                          </div>
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-surface/50">
                            {(it.gradeName ?? '—') + ' • ' + (it.className ?? '—')}
                          </div>
                          <div className="mt-3 text-sm text-on-surface/80">
                            {hint}
                          </div>
                          {it.topActions.length > 0 && (
                            <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-on-surface/80">
                              {it.topActions.slice(0, 2).map((a, idx) => (
                                <li key={idx}>{a}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-on-surface/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <p className="text-on-surface-variant">
            {t('children.noChildren', { defaultValue: 'No children linked yet.' })}
          </p>
        )}
      </div>
    </Layout>
  );
};

