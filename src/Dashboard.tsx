import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Eye, Wallet, Clock3, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { loadSession } from './lib/auth/session';
import { useParentChildren, useParentAnalysisOverview } from './hooks/parentQueries';
import { cn } from './lib/utils';

function formatErr(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string') return m;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

function severityUi(severity: 'ok' | 'watch' | 'urgent') {
  if (severity === 'urgent') {
    return {
      chip: 'bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/20',
      label: 'Urgent',
      icon: AlertTriangle,
    };
  }
  if (severity === 'watch') {
    return {
      chip: 'bg-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant border border-tertiary-fixed-dim/40',
      label: 'Watch',
      icon: Eye,
    };
  }
  return {
    chip: 'bg-surface-container-lowest text-on-surface/70 border border-outline-variant/20',
    label: 'Stable',
    icon: BookOpen,
  };
}

function shortEmail(email: string): string {
  if (email.length <= 28) return email;
  const at = email.indexOf('@');
  if (at <= 3) return `${email.slice(0, 10)}…`;
  return `${email.slice(0, Math.min(12, at))}…${email.slice(at)}`;
}

function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const session = loadSession();
  const { data: children, isLoading, error } = useParentChildren();
  const { data: overview } = useParentAnalysisOverview();

  const focusItems = useMemo(() => {
    return [...(overview?.items ?? [])]
      .sort((a, b) => {
        const rank = { urgent: 0, watch: 1, ok: 2 };
        return rank[a.severity] - rank[b.severity];
      })
      .slice(0, 3);
  }, [overview]);

  const familyHeadline =
    focusItems[0]?.topActions[0] ??
    overview?.summary ??
    t('dashboard.connectHint', {
      defaultValue: 'Generate weekly reports to see clear guidance here.',
    });

  const primaryItem = focusItems[0] ?? null;
  const latestDate =
    overview?.updatedAt != null ? new Date(overview.updatedAt).toLocaleDateString() : null;

  const feeRisk =
    (overview?.items ?? []).some((i) => (i.outstandingEstimate ?? 0) > 0) ||
    (overview?.urgentCount ?? 0) > 0
      ? (overview?.urgentCount ?? 0) > 0
        ? 'high'
        : (overview?.watchCount ?? 0) > 0
          ? 'medium'
          : 'low'
      : null;

  const totalDue = overview?.items?.reduce((sum, item) => sum + (item.outstandingEstimate ?? 0), 0) ?? 0;
  const childrenWithDues = overview?.items?.filter(item => (item.outstandingEstimate ?? 0) > 0) ?? [];
  
  let financeCardBg = 'bg-primary text-white';
  if (feeRisk === 'high' || totalDue > 0) {
    financeCardBg = feeRisk === 'high' ? 'bg-secondary text-white' : 'bg-orange-600 text-white';
  }
  if (totalDue === 0) {
    financeCardBg = 'bg-primary text-white';
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
        <section className="space-y-1">
          {/* <p className="font-serif font-bold text-[18px] sm:text-[24px] uppercase tracking-[0.2em] text-on-surface-variant">
            {t('dashboard.welcome', { defaultValue: 'Welcome back' })}
          </p> */}
          <div className="space-y-1 min-w-0">
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight text-primary">
              {t('dashboard.title', { defaultValue: 'Tableau de bord' })}
            </h2>
            <div className="text-xs text-on-surface-variant truncate max-w-full">
              {session?.email
                ? t('dashboard.signedInAsShort', {
                    defaultValue: 'Connecté : {{email}}',
                    email: shortEmail(session.email),
                  })
                : t('dashboard.parentLabel', { defaultValue: 'Parent' })}
            </div>
          </div>
        </section>

        {isLoading ? (
          <p className="font-mono text-sm text-on-surface-variant">
            {t('common.loading', { defaultValue: 'Loading…' })}
          </p>
        ) : error ? (
          <p className="text-error text-sm">{formatErr(error)}</p>
        ) : null}

        {/* Situation snapshot */}
        {/* <section className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl editorial-shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-extrabold tracking-tight text-primary">
                  {t('dashboard.situationTitle', { defaultValue: 'Aperçu de la situation' })}
                </h3>
               
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniMetric 
              label={t('dashboard.urgentChildren', { defaultValue: 'Urgent children' })} 
              value={String(overview?.urgentCount ?? 0)} 
              severity={(overview?.urgentCount ?? 0) > 0 ? 'urgent' : 'ok'}
            />
            <MiniMetric 
              label={t('dashboard.watchChildren', { defaultValue: 'Watch items' })} 
              value={String(overview?.watchCount ?? 0)} 
              severity={(overview?.watchCount ?? 0) > 0 ? 'watch' : 'ok'}
            />
            <MiniMetric 
              label={t('dashboard.linkedChildren', { defaultValue: 'Linked children' })} 
              value={String(children?.length ?? 0)} 
              severity="neutral"
            />
            <MiniMetric
              label={t('dashboard.latestReportCard', { defaultValue: 'Latest report' })}
              value={latestDate ?? t('dashboard.noneShort', { defaultValue: 'None' })}
              severity="neutral"
            />
          </div>
        </section> */}

        <section className={cn("rounded-2xl p-6 shadow-lg relative overflow-hidden", financeCardBg)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <h3 className="font-serif text-xl font-bold mb-6 relative z-10">
            {t('report.sectionFinance', { defaultValue: 'Résumé des frais' })}
          </h3>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                {t('dashboard.finance.totalDue', { defaultValue: 'Total des frais dus' })}
              </p>
              <div className="text-3xl font-extrabold tracking-tighter">
                {formatMoney(totalDue)}
              </div>
            </div>

            {childrenWithDues.length > 0 && (
              <div className="pt-4 border-t border-white/20">
                <p className="text-white/80 text-sm font-medium mb-3">
                  {t('dashboard.finance.duePerChild', { defaultValue: 'Détail par enfant' })}
                </p>
                <div className="space-y-3">
                  {childrenWithDues.map(child => (
                    <div key={child.studentId} className="flex justify-between items-center text-sm">
                      <span className="font-bold">{child.studentName}</span>
                      <span className="font-bold">{formatMoney(child.outstandingEstimate ?? 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {totalDue > 0 && (
            <Link to="/reports" className="mt-6 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 shadow-md relative z-10 flex justify-center items-center">
              {t('report.cta.pay_now', { defaultValue: 'Régler le solde' })}
            </Link>
          )}
        </section>

        {/* Primary alert */}
        {primaryItem && (
          <section className="rounded-2xl overflow-hidden border border-secondary/10 bg-secondary-fixed shadow-sm">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface/70">
                    {t('dashboard.keyAlert', { defaultValue: 'Alertes clés' })}
                  </span>
                  <div className="mt-3">
                    <div className="font-serif text-xl font-bold text-secondary truncate">
                      {primaryItem.studentName}
                    </div>
                    <p className="mt-2 text-sm text-on-secondary-fixed-variant leading-relaxed line-clamp-2">
                      {primaryItem.topActions[0] ??
                        t('dashboard.openWeeklyReport', { defaultValue: 'Open the weekly report for detailed guidance.' })}
                    </p>
                  </div>
                </div>
                <AlertTriangle className="w-7 h-7 text-secondary shrink-0" />
              </div>
              <Link
                to={primaryItem.reportId ? `/reports/child/${primaryItem.studentId}/${primaryItem.reportId}` : `/reports/child/${primaryItem.studentId}`}
                className="mt-4 w-full py-3 bg-secondary text-white font-bold rounded-xl active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
              >
                {t('dashboard.openNow', { defaultValue: 'Ouvrir' })}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-primary">
              {t('dashboard.actionableChildren', { defaultValue: 'Children needing attention' })}
            </h3>
            <Link className="font-mono text-[10px] uppercase tracking-widest text-primary" to="/children">
              {t('common.viewChildren', { defaultValue: 'View children' })}
            </Link>
          </div>

          {focusItems.length ? (
            <div className="grid gap-3">
              {focusItems.map((item) => {
                const ui = severityUi(item.severity);
                const Icon = ui.icon;
                const bg =
                  item.severity === 'urgent'
                    ? 'bg-red-50 hover:bg-red-50/80'
                    : item.severity === 'watch'
                      ? 'bg-orange-50 hover:bg-orange-50/80'
                      : 'bg-surface-container-lowest hover:bg-white';
                return (
                  <Link
                    key={item.studentId}
                    to={
                      item.reportId
                        ? `/reports/child/${item.studentId}/${item.reportId}`
                        : `/reports/child/${item.studentId}`
                    }
                    className={cn(
                      'p-4 rounded-2xl editorial-shadow transition-colors border border-outline-variant/10',
                      bg,
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-serif text-base text-on-surface truncate">
                          {item.studentName}
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-on-surface/45 mt-1 truncate">
                          {[item.gradeName, item.className].filter(Boolean).join(' • ') || '—'}
                        </div>
                        <p className="mt-2 text-sm text-on-surface/75 line-clamp-1">
                          {item.failureProbabilityText ??
                            item.topActions[0] ??
                            t('dashboard.openWeeklyReport', {
                              defaultValue: 'Open the weekly report for the detailed guidance.',
                            })}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.failureProbabilityPercent != null && (
                            <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 bg-white/70 text-on-surface/70 rounded-full border border-outline-variant/20">
                              {t('dashboard.risk.failChance', { defaultValue: 'Fail chance' })}:{' '}
                              {Math.round(item.failureProbabilityPercent)}%
                            </span>
                          )}
                          {item.outstandingEstimate != null && item.outstandingEstimate > 0 && (
                            <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full border border-secondary/15">
                              {t('dashboard.feesOutstanding', { defaultValue: 'Fees due' })}
                            </span>
                          )}
                          {item.weakSubjects[0] && (
                            <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-container-high text-on-surface/70 rounded-full border border-outline-variant/15">
                              {item.weakSubjects[0].subject}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest',
                            ui.chip,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {t(`dashboard.severity.${item.severity}`, { defaultValue: ui.label })}
                        </span>
                        <ChevronRight className="w-4 h-4 text-on-surface/30" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-lowest p-5 rounded-xl editorial-shadow text-sm text-on-surface/70">
              {t('dashboard.noPriorityChildren', {
                defaultValue: 'No urgent weekly issues are visible right now.',
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

function MiniMetric({ label, value, severity }: { label: string; value: string; severity?: 'urgent' | 'watch' | 'ok' | 'neutral' }) {
  const bgClass = severity === 'urgent' ? 'bg-red-50 border-red-200 text-red-900' :
                  severity === 'watch' ? 'bg-orange-50 border-orange-200 text-orange-900' :
                  severity === 'ok' ? 'bg-green-50 border-green-200 text-green-900' :
                  'bg-surface-container-low border-outline-variant/10 text-on-surface';

  return (
    <div className={cn("rounded-xl p-3 border", bgClass)}>
      <div className={cn("font-mono text-[9px] uppercase tracking-widest", severity && severity !== 'neutral' ? "opacity-70" : "text-on-surface/50")}>{label}</div>
      <div className="mt-1 font-serif text-xl font-bold">{value}</div>
    </div>
  );
}
