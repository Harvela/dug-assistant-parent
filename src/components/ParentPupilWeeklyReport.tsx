import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import type { AnalysisReportDto } from '../hooks/parentQueries';
import {
  parsePupilWeeklyReport,
  supportSubjectsRows,
} from '../lib/analysis/pupilWeeklyReportModel';

function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}

function riskChipClass(level: string | null): string {
  const l = (level ?? '').toLowerCase();
  if (l === 'high') return 'bg-[#835058]/15 text-[#5c2f38]';
  if (l === 'medium') return 'bg-amber-100 text-amber-900';
  if (l === 'low') return 'bg-primary/10 text-primary';
  return 'bg-surface-container-low text-on-surface/60';
}

function failureTone(pct: number | null): 'ok' | 'watch' | 'urgent' {
  if (pct == null) return 'ok';
  if (pct >= 60) return 'urgent';
  if (pct >= 30) return 'watch';
  return 'ok';
}

export const ParentPupilWeeklyReport: React.FC<{
  report: AnalysisReportDto;
  showNarrativeHeadline?: boolean;
  className?: string;
}> = ({ report, showNarrativeHeadline = true, className }) => {
  const { t } = useTranslation();
  const parsed = useMemo(() => parsePupilWeeklyReport(report), [report]);
  const { facts, narrative } = parsed;

  const supportRows = useMemo(() => supportSubjectsRows(parsed, 3), [parsed]);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);

  const failTone = failureTone(narrative.academic.failureProbabilityPercent);
  const failBg =
    failTone === 'urgent'
      ? 'bg-red-50 border-red-200 text-red-900'
      : failTone === 'watch'
        ? 'bg-orange-50 border-orange-200 text-orange-900'
        : 'bg-green-50 border-green-200 text-green-900';

  const financeTone = (narrative.finance.riskLevel ?? '').toLowerCase();
  const financeCardBg =
    financeTone === 'high'
      ? 'bg-secondary text-white'
      : financeTone === 'medium'
        ? 'bg-orange-600 text-white'
        : 'bg-primary text-white';

  return (
    <div className={cn('space-y-6 min-w-0', className)}>
      {narrative.parseError && (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/40 px-4 py-3 font-mono text-[10px] text-on-surface/60">
          {t('report.narrativeParseError', {
            defaultValue: 'The narrative could not be structured. The facts are still shown below.',
          })}
        </div>
      )}

      {showNarrativeHeadline && narrative.headline && (
        <div className="bg-surface-container-low rounded-xl p-5">
          <div className="font-serif text-2xl font-extrabold tracking-tight text-primary">
            {t('report.cards.situationTitle', { defaultValue: 'Aperçu de la Situation' })}
          </div>
          <div className="mt-2 text-sm text-on-surface-variant leading-relaxed">
            {narrative.headline}
          </div>
          {narrative.finance.riskLevel && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-surface-container-lowest px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface/50">
                {t('report.financeRisk', { defaultValue: 'Fee risk' })}
              </div>
              <span className={cn('px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest', riskChipClass(narrative.finance.riskLevel))}>
                {t(`report.risk.${String(narrative.finance.riskLevel).toLowerCase()}`, { defaultValue: narrative.finance.riskLevel })}
              </span>
            </div>
          )}
        </div>
      )}

      
      {/* Academic + Finance summaries */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        <div className={cn('md:col-span-5 rounded-xl p-6 shadow-lg relative overflow-hidden', financeCardBg)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <h3 className="font-serif text-xl font-bold mb-6 relative z-10">
            {t('report.sectionFinance', { defaultValue: 'Résumé des frais' })}
          </h3>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                {t('report.cards.paidThisYear', { defaultValue: 'Montant payé (année)' })}
              </p>
              <div className="text-3xl font-extrabold tracking-tighter">
                {facts.finance.paidInYear != null ? formatMoney(facts.finance.paidInYear) : '—'}
              </div>
            </div>

            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                {t('report.kpiOutstanding', { defaultValue: 'Outstanding fees' })}
              </p>
              <div className="text-2xl font-bold tracking-tighter">
                {facts.finance.outstandingEstimate != null ? formatMoney(facts.finance.outstandingEstimate) : '—'}
              </div>
            </div>
          </div>
          {narrative.finance.proposedPaymentPlans.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20 relative z-10">
              <button
                type="button"
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 shadow-md"
                onClick={() => setShowPaymentPlans((v) => !v)}
              >
                {t('report.paymentPlans.open', { defaultValue: 'Plan de paiement' })}
              </button>

              {showPaymentPlans && (
                <div className="mt-4 grid gap-3">
                  {narrative.finance.proposedPaymentPlans.slice(0, 3).map((p) => {
                    const selected = selectedPlanName != null && selectedPlanName === p.planName;
                    return (
                      <button
                        key={p.planName}
                        type="button"
                        onClick={() => setSelectedPlanName(p.planName)}
                        className={cn(
                          'text-left rounded-xl p-4 bg-white/10 border border-white/20 hover:bg-white/15 transition-colors',
                          selected && 'ring-2 ring-white/70',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{p.planName}</div>
                            {p.description ? (
                              <div className="mt-1 text-sm text-white/85 leading-snug">
                                {p.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="font-serif text-lg font-extrabold text-white">
                              {p.monthlyAmount != null ? formatMoney(p.monthlyAmount) : '—'}
                            </div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-white/70">
                              {p.durationMonths != null
                                ? t('report.paymentPlans.months', {
                                    defaultValue: '{{n}} mois',
                                    n: Math.round(p.durationMonths),
                                  })
                                : t('report.paymentPlans.monthly', { defaultValue: 'mensuel' })}
                            </div>
                          </div>
                        </div>
                        {selected ? (
                          <div className="mt-3 font-mono text-[9px] uppercase tracking-widest text-white/80">
                            {t('report.paymentPlans.selected', { defaultValue: 'Sélectionné' })}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button className="mt-6 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 shadow-md relative z-10">
            {t('report.cta.pay_now', { defaultValue: 'Régler le solde' })}
          </button>
        </div>
        <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl font-bold text-primary">
              {t('report.sectionAcademic', { defaultValue: 'Résumé scolaire' })}
            </h3>
          </div>

          {(narrative.academic.failureProbabilityPercent != null || narrative.academic.failureProbabilityText) && (
            <div className={cn('rounded-xl border p-4 mb-4', failBg)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                    {t('report.failRisk.title', { defaultValue: "Risque d'échec" })}
                  </div>
                  <div className="mt-1 text-sm font-semibold leading-snug">
                    {narrative.academic.failureProbabilityText ??
                      t('report.failRisk.defaultText', { defaultValue: "Estimé à partir des données de cette semaine." })}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-serif text-2xl font-extrabold">
                    {narrative.academic.failureProbabilityPercent != null
                      ? `${Math.round(narrative.academic.failureProbabilityPercent)}%`
                      : '—'}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest opacity-70">
                    {t('report.failRisk.prob', { defaultValue: 'prob.' })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {narrative.academic.summary && (
            <p className="text-sm text-on-surface-variant leading-relaxed">{narrative.academic.summary}</p>
          )}

          <div className="mt-6 grid gap-6">
            {narrative.academic.strengths.length > 0 && (
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container/20 rounded-full" />
                <h4 className="text-[11px] font-bold text-primary-container uppercase tracking-widest mb-3">
                  {t('report.cards.strengths', { defaultValue: 'Points forts' })}
                </h4>
                <ul className="space-y-2 text-sm text-on-surface">
                  {narrative.academic.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-on-surface-variant leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {narrative.academic.weaknesses.length > 0 && (
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/20 rounded-full" />
                <h4 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-3">
                  {t('report.cards.concerns', { defaultValue: 'Points de vigilance' })}
                </h4>
                <ul className="space-y-2 text-sm text-on-surface">
                  {narrative.academic.weaknesses.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-on-surface-variant leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Details bento */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 bg-surface-container-low rounded-xl p-5 shadow-sm  flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-primary">
                {t('report.cards.attendanceWeekTitle', { defaultValue: 'Présence Cette Semaine' })}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {facts.attendanceWeek.ratePercent != null
                  ? t('report.cards.attendanceAvg', { defaultValue: 'Taux d’assiduité moyen : {{n}}%', n: Math.round(facts.attendanceWeek.ratePercent) })
                  : t('report.cards.attendanceAvgNA', { defaultValue: 'Taux d’assiduité moyen : —' })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-extrabold text-primary-container">
                {facts.attendanceWeek.present != null ? facts.attendanceWeek.present : '—'}
                <span className="text-sm sm:text-base font-normal opacity-60">
                  /{facts.attendanceWeek.totalRecords != null ? facts.attendanceWeek.totalRecords : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden flex">
              {(() => {
                const total = facts.attendanceWeek.totalRecords ?? 0;
                const present = facts.attendanceWeek.present ?? 0;
                const late = facts.attendanceWeek.late ?? 0;
                const absent = facts.attendanceWeek.absent ?? 0;
                const p = total > 0 ? (present / total) * 100 : 0;
                const l = total > 0 ? (late / total) * 100 : 0;
                const a = total > 0 ? (absent / total) * 100 : 0;
                return (
                  <>
                    <div className="h-full bg-primary-container" style={{ width: `${p}%` }} />
                    <div className="h-full bg-primary-fixed-dim" style={{ width: `${l}%` }} />
                    <div className="h-full bg-secondary/70" style={{ width: `${a}%` }} />
                  </>
                );
              })()}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-widest text-on-surface/55">
              <span>{t('report.legendPresent', { defaultValue: 'Present' })}: {facts.attendanceWeek.present ?? '—'}</span>
              <span>{t('report.legendLate', { defaultValue: 'Late' })}: {facts.attendanceWeek.late ?? '—'}</span>
              <span>{t('report.legendAbsent', { defaultValue: 'Absent' })}: {facts.attendanceWeek.absent ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-secondary-fixed rounded-xl p-4 sm:p-5 shadow-sm border-l-4 border-secondary flex flex-col justify-center flex-1">
            <span className="text-on-secondary-fixed-variant text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
              {t('report.cards.pointsAttention', { defaultValue: "Points d'Attention" })}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-on-secondary-container">
                {t('report.cards.alertCount', { defaultValue: '{{n}} Alertes', n: Math.min(9, insights.length || (alert.severity === 'ok' ? 0 : 1)) })}
              </span>
            </div>
          </div>
        </div> */}

        <div className="md:col-span-5 bg-surface-container-low rounded-xl p-5 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-primary mb-4">
            {t('report.cards.supportSubjectsTitle', { defaultValue: 'Matières à Soutenir' })}
          </h3>
          {supportRows.length ? (
            <div className="space-y-5">
              {supportRows.map((r) => (
                <div key={r.subject} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold gap-3">
                    <span className={cn(r.tone === 'good' && 'text-on-surface-variant', 'truncate')}>{r.subject}</span>
                    <span className={cn('shrink-0', r.tone === 'bad' ? 'text-secondary' : r.tone === 'watch' ? 'text-tertiary' : 'text-primary-container')}>
                      {r.ratio != null ? `${Math.round(r.ratio)}%` : '—'}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        r.tone === 'bad' ? 'bg-secondary' : r.tone === 'watch' ? 'bg-tertiary-fixed-dim' : 'bg-primary-container',
                      )}
                      style={{ width: `${r.ratio ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-on-surface-variant">
              {t('report.cards.supportSubjectsEmpty', { defaultValue: 'Aucune matière prioritaire détectée cette semaine.' })}
            </div>
          )}
          <button className="mt-6 w-full py-3 bg-surface-container-highest text-primary font-bold rounded-xl hover:bg-primary-fixed transition-colors">
            {t('report.cta.plan_tutoring', { defaultValue: 'Planifier un tutorat' })}
          </button>
        </div>
      </section>


      {/* Recommended actions */}
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-primary">
          {t('report.nextSteps', { defaultValue: 'Suggested next steps' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const actions = [
              ...narrative.academic.recommendations,
              ...narrative.finance.paymentSchemes,
            ]
              .map((x) => String(x).trim())
              .filter(Boolean)
              .slice(0, 3);
            if (actions.length === 0) {
              return (
                <div className="md:col-span-3 bg-surface-container-low p-5 rounded-xl text-sm text-on-surface-variant">
                  {t('report.cards.actionsEmpty', { defaultValue: 'No recommended actions for this week yet.' })}
                </div>
              );
            }
            return actions.map((a, i) => (
              <div
                key={i}
                className="bg-surface-container-low p-5 rounded-xl group hover:bg-surface-container-lowest transition-all cursor-pointer"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">
                  {t('report.cards.action', { defaultValue: 'Action' })} {i + 1}
                </div>
                <p className="font-bold text-on-surface mb-1">{a}</p>
                <p className="text-sm text-on-surface-variant">
                  {t('report.cards.actionHint', { defaultValue: 'Suggested from this week’s report.' })}
                </p>
              </div>
            ));
          })()}
        </div>
      </section>
    </div>
  );
};
