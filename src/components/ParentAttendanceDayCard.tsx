import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useChildAttendanceDaily } from '../hooks/parentQueries';
import { cn } from '../lib/utils';

type Props = {
  studentId?: string;
  day: string;
  onDayChange: (day: string) => void;
  enabled?: boolean;
};

function formatTs(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export const ParentAttendanceDayCard: React.FC<Props> = ({
  studentId,
  day,
  onDayChange,
  enabled = true,
}) => {
  const { t } = useTranslation();
  const q = useChildAttendanceDaily(studentId, day, {
    enabled: Boolean(studentId && day && enabled),
  });

  const pts = q.data?.transportPoints ?? [];
  const center = useMemo(() => {
    if (!pts.length) return [-4.32, 15.32] as [number, number];
    const lat =
      pts.reduce((s, p) => s + p.latitude, 0) / pts.length;
    const lng =
      pts.reduce((s, p) => s + p.longitude, 0) / pts.length;
    return [lat, lng] as [number, number];
  }, [pts]);

  return (
    <div className="rounded-xl border border-outline-variant/10 bg-white editorial-shadow overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-outline-variant/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-on-surface-variant mb-1">
              {t('parentAttendance.label', { defaultValue: 'Attendance' })}
            </p>
            <h3 className="font-serif text-xl text-primary font-semibold">
              {t('parentAttendance.dayTitle', {
                defaultValue: 'Arrival & exit',
              })}
            </h3>
          </div>
          <label className="space-y-1 shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
              {t('parentAttendance.pickDay', { defaultValue: 'Day' })}
            </span>
            <input
              type="date"
              value={day}
              onChange={(e) => onDayChange(e.target.value)}
              className="block rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-sm font-mono"
            />
          </label>
        </div>

        {q.isPending ? (
          <p className="font-mono text-xs text-on-surface-variant">
            {t('common.loading', { defaultValue: 'Loading…' })}
          </p>
        ) : q.isError ? (
          <p className="font-mono text-xs text-error">
            {(q.error as Error)?.message ??
              t('common.errorGeneric', { defaultValue: 'Something went wrong' })}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-surface-container-low/40 border border-outline-variant/15 p-4">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant mb-1">
                {t('parentAttendance.arrival', { defaultValue: 'Arrival' })}
              </p>
              <p className="font-serif text-lg font-semibold text-on-surface">
                {formatTs(q.data?.arrivalTime)}
              </p>
            </div>
            <div className="rounded-lg bg-surface-container-low/40 border border-outline-variant/15 p-4">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant mb-1">
                {t('parentAttendance.exit', { defaultValue: 'Exit' })}
              </p>
              <p className="font-serif text-lg font-semibold text-on-surface">
                {formatTs(q.data?.exitTime)}
              </p>
            </div>
          </div>
        )}
      </div>

      {!q.isPending && !q.isError && pts.length > 0 ? (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {t('parentAttendance.transportMap', {
              defaultValue: 'Transport pickup / drop-off',
            })}
          </p>
          <div
            className={cn(
              'h-[260px] rounded-xl overflow-hidden border border-outline-variant/20 z-0',
            )}
          >
            <MapContainer
              center={center}
              zoom={13}
              className="h-full w-full"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pts.map((p, idx) => (
                <CircleMarker
                  key={`${p.scannedAt}-${idx}`}
                  center={[p.latitude, p.longitude]}
                  radius={9}
                  pathOptions={{
                    color: p.kind === 'bus_drop' ? '#ba1a1a' : '#2a6861',
                    fillOpacity: 0.85,
                  }}
                >
                  <Popup>
                    <div className="font-mono text-[11px] space-y-1">
                      <div>{p.kind}</div>
                      <div>{formatTs(p.scannedAt)}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      ) : !q.isPending && !q.isError && (q.data?.events?.length ?? 0) > 0 ? (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
            {t('parentAttendance.timeline', { defaultValue: 'Today’s scans' })}
          </p>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {(q.data?.events ?? []).slice(0, 12).map((e, i) => (
              <li
                key={`${e.scannedAt}-${i}`}
                className="flex justify-between gap-2 font-mono text-[11px] border-b border-outline-variant/10 pb-2"
              >
                <span className="text-on-surface-variant">{e.scanKind}</span>
                <span>{formatTs(e.scannedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
