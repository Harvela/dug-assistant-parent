import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Layout } from './components/Layout';
import { cn } from './lib/utils';
import {
  useChildAnalysisReport,
  useChildAnalysisReports,
  useParentChildren,
} from './hooks/parentQueries';
import { ParentPupilWeeklyReport } from './components/ParentPupilWeeklyReport';

export const ChildReport: React.FC = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { studentId, reportId } = useParams<{ studentId: string; reportId?: string }>();
  const sid = studentId;
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: children } = useParentChildren();
  const child = children?.find((c) => c.id === sid);

  const { data: paged, isLoading: loadingList, error: listErr } = useChildAnalysisReports(sid, page, limit);
  const reports = paged?.data ?? [];
  const selectedId = reportId ?? reports[0]?.id;
  const { data: selected, isLoading: loadingOne, error: oneErr } = useChildAnalysisReport(sid, selectedId);

  const totalPages = paged?.totalPages ?? 1;

  const reportOptions = useMemo(() => {
    return reports.map((r) => ({
      id: r.id,
      label: `${r.periodStart} → ${r.periodEnd}`,
      meta: new Date(r.createdAt).toLocaleDateString(),
    }));
  }, [reports]);

  return (
    <Layout showTopBar={false} showBottomNav={false}>
      <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 px-2 sm:px-2">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/reports"
            className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest hover:opacity-80"
          >
            <ArrowLeft className="w-4 h-4" /> {t('common.back', { defaultValue: 'Back' })}
          </Link>
        </div>

        <header className="space-y-3">
          <div className="space-y-1">
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
              {t('childReport.title', { defaultValue: 'Détails des Rapports' })}
            </h2>
            <p className="text-on-surface-variant text-sm">
              {t('childReport.subtitle', {
                defaultValue: "Analyse complète des performances et de l'engagement hebdomadaire.",
              })}
            </p>
          </div>

          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl editorial-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mt-2 font-serif font-bold text-2xl text-on-surface truncate">{child?.name ?? '—'}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-surface/50 truncate">
                  {[child?.gradeName].filter(Boolean).join(' • ') || '—'}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="min-w-0 flex-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-on-surface/45">
                  {t('childReport.pickWeek', { defaultValue: 'Choisir une semaine' })}
                </label>
                <div className="mt-2">
                  <select
                    value={selectedId ?? ''}
                    className="w-full rounded-xl border border-outline-variant/20 bg-white px-3 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={loadingList || reportOptions.length === 0}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (!next) return;
                      nav(`/reports/child/${sid}/${next}`);
                    }}
                  >
                    {reportOptions.length === 0 ? (
                      <option value="">{t('childReport.noReports', { defaultValue: 'Aucun rapport pour le moment.' })}</option>
                    ) : null}
                    {reportOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-1 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  className={cn(
                    'p-2 border border-outline-variant/20 text-on-surface/70 hover:text-primary rounded-xl',
                    page <= 1 && 'opacity-40 pointer-events-none',
                  )}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="font-mono text-[10px] text-on-surface/60 px-2">
                  {page}/{totalPages}
                </div>
                <button
                  type="button"
                  className={cn(
                    'p-2 border border-outline-variant/20 text-on-surface/70 hover:text-primary rounded-xl',
                    page >= totalPages && 'opacity-40 pointer-events-none',
                  )}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {loadingList ? (
                <div className="sm:col-span-2 font-mono text-xs text-on-surface/50">
                  {t('common.loading', { defaultValue: 'Loading…' })}
                </div>
              ) : listErr ? (
                <div className="sm:col-span-2 font-mono text-xs text-error">
                  {t('common.errorGeneric', { defaultValue: 'Something went wrong' })}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="min-w-0">
          {loadingOne ? (
            <div className="border border-outline-variant/10 bg-white p-4 font-mono text-xs text-on-surface/60 rounded-xl">
              {t('common.loading', { defaultValue: 'Loading…' })}
            </div>
          ) : oneErr ? (
            <div className="border border-outline-variant/10 bg-white p-4 font-mono text-xs text-error rounded-xl">
              {t('common.errorGeneric', { defaultValue: 'Something went wrong' })}
            </div>
          ) : selected ? (
            <ParentPupilWeeklyReport report={selected} showNarrativeHeadline={false} />
          ) : (
            <div className="border border-outline-variant/10 bg-white p-4 font-mono text-xs text-on-surface/60 rounded-xl">
              —
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};
