import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChildAttendanceReport } from '../hooks/parentQueries';

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export const ParentAttendanceReportTab: React.FC<{ studentId?: string }> = ({
  studentId,
}) => {
  const { t } = useTranslation();
  const [{ from, to }, setRange] = useState(defaultRange);

  useEffect(() => {
    setRange(defaultRange());
  }, [studentId]);

  const q = useChildAttendanceReport(studentId, from, to, {
    enabled: Boolean(studentId),
  });

  const sortedDays = useMemo(() => {
    const days = [...(q.data?.days ?? [])];
    days.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
    return days;
  }, [q.data?.days]);

  function scanKindLabel(kind: string): string {
    switch (kind) {
      case 'entry':
        return t('childReport.attendance.scanKind.entry', { defaultValue: 'Entry' });
      case 'exit':
        return t('childReport.attendance.scanKind.exit', { defaultValue: 'Exit' });
      case 'bus_pickup':
        return t('childReport.attendance.scanKind.pickup', { defaultValue: 'Bus pickup' });
      case 'bus_drop':
        return t('childReport.attendance.scanKind.drop', { defaultValue: 'Bus drop-off' });
      default:
        return kind;
    }
  }

  return (
    <div className="rounded-xl border border-outline-variant/10 bg-white editorial-shadow overflow-hidden space-y-4 p-5 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-on-surface-variant">
            {t('childReport.attendance.tabLabel', { defaultValue: 'Attendance' })}
          </p>
          <h3 className="font-serif text-xl text-primary font-semibold">
            {t('childReport.attendance.timelineTitle', {
              defaultValue: 'Scan timeline',
            })}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="space-y-1">
            <span className="font-mono text-[9px] uppercase text-on-surface-variant">
              {t('childReport.attendance.from', { defaultValue: 'From' })}
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="block rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-sm font-mono"
            />
          </label>
          <label className="space-y-1">
            <span className="font-mono text-[9px] uppercase text-on-surface-variant">
              {t('childReport.attendance.to', { defaultValue: 'To' })}
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="block rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-sm font-mono"
            />
          </label>
        </div>
      </header>

      {q.isPending ? (
        <p className="font-mono text-xs text-on-surface-variant">
          {t('common.loading', { defaultValue: 'Loading…' })}
        </p>
      ) : q.isError ? (
        <p className="font-mono text-xs text-error">
          {(q.error as Error)?.message ??
            t('common.errorGeneric', { defaultValue: 'Something went wrong' })}
        </p>
      ) : sortedDays.length === 0 ? (
        <p className="text-sm text-on-surface/70">—</p>
      ) : (
        <ul className="space-y-4">
          {sortedDays.map((d) => {
            const arrivalShort = d.arrivalTime
              ? new Date(d.arrivalTime).toLocaleTimeString(undefined, {
                  timeStyle: 'short',
                })
              : '—';
            const exitShort = d.exitTime
              ? new Date(d.exitTime).toLocaleTimeString(undefined, {
                  timeStyle: 'short',
                })
              : '—';
            return (
              <li
                key={d.day}
                className="rounded-xl border border-outline-variant/15 bg-surface-container-low/35 p-4 space-y-2"
              >
                <div className="flex flex-wrap justify-between gap-2 items-baseline">
                  <span className="font-serif font-semibold text-lg text-on-surface">
                    {new Date(`${d.day}T12:00:00`).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-mono text-[10px] text-on-surface-variant">
                    {arrivalShort} → {exitShort}
                  </span>
                </div>
                {d.events.length === 0 ? (
                  <p className="font-mono text-xs text-on-surface-variant">
                    {t('childReport.attendance.noEvents', {
                      defaultValue: 'No scan events.',
                    })}
                  </p>
                ) : (
                  <ul className="border-t border-outline-variant/15 pt-2 space-y-2">
                    {d.events.map((e, idx) => (
                      <li
                        key={`${e.scannedAt}-${idx}`}
                        className="flex flex-wrap justify-between gap-2 font-mono text-xs text-on-surface"
                      >
                        <span className="text-on-surface/80">
                          {scanKindLabel(e.scanKind)}{' '}
                          <span className="text-on-surface-variant">({e.statusRecorded})</span>
                        </span>
                        <span className="shrink-0">
                          {new Date(e.scannedAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
