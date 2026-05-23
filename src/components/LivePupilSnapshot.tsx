import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../lib/utils';
import type {
  ParentFinanceSnapshotDto,
  ParentYearBulletinGridDto,
} from '../types/liveSnapshot';
import { formatParentFinanceDebt } from '../lib/financeDisplay';

type Props = {
  finance?: ParentFinanceSnapshotDto | null;
  bulletin?: ParentYearBulletinGridDto | null;
  financePending?: boolean;
  bulletinPending?: boolean;
  financeError?: boolean;
  bulletinError?: boolean;
  className?: string;
};

export const LivePupilSnapshot: React.FC<Props> = ({
  finance,
  bulletin,
  financePending,
  bulletinPending,
  financeError,
  bulletinError,
  className,
}) => {
  const { t } = useTranslation();

  const subjectPctRows = useMemo(() => {
    if (!bulletin?.subjects?.length) return [];
    return [...bulletin.subjects]
      .filter((s) => s.totalsGeneral.percentage != null)
      .sort((a, b) => (b.totalsGeneral.percentage ?? 0) - (a.totalsGeneral.percentage ?? 0))
      .slice(0, 12)
      .map((s) => ({
        name:
          s.subjectName.length > 22 ? `${s.subjectName.slice(0, 20)}…` : s.subjectName,
        pct: Math.round(s.totalsGeneral.percentage ?? 0),
      }));
  }, [bulletin]);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className={cn('space-y-8 min-w-0', className)}>
      <section className="rounded-xl border border-outline-variant/15 bg-surface-container-low/30 p-5 lg:p-6">
        <h3 className="font-serif text-lg text-on-surface mb-4">
          {t('report.live.sectionFinance', { defaultValue: 'Fees (live)' })}
        </h3>
        {financePending ? (
          <p className="font-mono text-xs text-on-surface/50">{t('common.loading')}</p>
        ) : financeError ? (
          <p className="font-mono text-xs text-error">{t('report.live.financeError')}</p>
        ) : finance ? (
          <>
            {finance.legacyApprox && (
              <p className="mb-4 text-xs font-mono text-on-surface-variant border border-outline-variant/20 rounded-lg p-2 bg-white/60">
                {t('report.live.legacyDisclaimer', {
                  defaultValue:
                    'Per-fee lines may be approximate when using a legacy combined payment plan.',
                })}
              </p>
            )}
            {finance.personnelDiscountEligible && (
              <p className="mb-4 text-xs font-mono text-primary/90 border border-primary/20 rounded-lg p-2 bg-primary/5">
                {t('report.live.personnelDiscountNote', {
                  defaultValue:
                    'Personnel-linked fee discounts apply to this child’s expected amounts.',
                })}
              </p>
            )}
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface/45">
                  {t('report.live.totalRemaining', { defaultValue: 'Remaining this year' })}
                </p>
                <p className="font-mono text-2xl font-bold text-primary tabular-nums break-words max-w-full">
                  {formatParentFinanceDebt(finance)}
                </p>
              </div>
            </div>
            {finance.lines.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/15 font-mono text-[10px] uppercase text-on-surface/45 text-left">
                      <th className="py-2 pr-4">{t('report.live.colFee', { defaultValue: 'Fee' })}</th>
                      <th className="py-2 text-right tabular-nums">
                        {t('report.live.colExpectedAnnual', { defaultValue: 'Annual expected' })}
                      </th>
                      <th className="py-2 text-right tabular-nums">
                        {t('report.live.colPaidYtd', { defaultValue: 'Paid (year)' })}
                      </th>
                      <th className="py-2 text-right tabular-nums">{t('report.live.colRemaining')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {finance.lines.map((line) => (
                      <tr key={line.feeId}>
                        <td className="py-2 pr-4 font-sans">{line.name}</td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {fmtMoney(line.annualExpected ?? 0)}
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {fmtMoney(line.paidInYear ?? 0)}
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {fmtMoney(line.remaining)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="font-mono text-xs text-on-surface/55">—</p>
        )}
      </section>

      <section className="rounded-xl border border-outline-variant/15 bg-white p-5 lg:p-6 shadow-sm">
        <h3 className="font-serif text-lg text-on-surface mb-4">
          {t('report.live.sectionAcademic', { defaultValue: 'Academic progress (bulletin)' })}
        </h3>
        {bulletinPending ? (
          <p className="font-mono text-xs text-on-surface/50">{t('common.loading')}</p>
        ) : bulletinError ? (
          <p className="font-mono text-xs text-error">{t('report.live.academicError')}</p>
        ) : bulletin ? (
          <>
            <div className="flex flex-wrap gap-8 mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface/45">
                  {t('report.live.yearAveragePct', { defaultValue: 'Year average' })}
                </p>
                <p className="font-mono text-2xl font-bold text-primary tabular-nums">
                  {bulletin.student.yearPercentage != null
                    ? `${Math.round(bulletin.student.yearPercentage)}%`
                    : bulletin.aggregates.grandPercentage != null
                      ? `${Math.round(bulletin.aggregates.grandPercentage)}%`
                      : '—'}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface/45">
                  {t('report.live.classContext', { defaultValue: 'Class / year' })}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {bulletin.academicYear} · {bulletin.className} · {bulletin.gradeName}
                </p>
              </div>
            </div>

            {subjectPctRows.length > 0 ? (
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPctRows} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-outline-variant/30" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, t('report.live.pct')]}
                      labelStyle={{ fontSize: 11 }}
                    />
                    <Bar dataKey="pct" fill="#2a6861" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="font-mono text-xs text-on-surface/55">{t('report.live.noSubjectPct')}</p>
            )}
          </>
        ) : (
          <p className="font-mono text-xs text-on-surface/55">—</p>
        )}
      </section>
    </div>
  );
};
