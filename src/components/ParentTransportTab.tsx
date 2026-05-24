import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useChildTransportSnapshot } from '../hooks/parentQueries';
import {
  TransportScanBottomSheet,
  type TransportScanSheetGroup,
  type TransportScanSheetEvent,
} from './TransportScanBottomSheet';
import { cn } from '../lib/utils';

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

const GROUP_DISTANCE_METERS = 25;

function distanceMeters(
  a: { latitude: number | null; longitude: number | null },
  b: { latitude: number | null; longitude: number | null },
): number {
  const lat1 = Number(a.latitude);
  const lon1 = Number(a.longitude);
  const lat2 = Number(b.latitude);
  const lon2 = Number(b.longitude);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Infinity;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function sortNewestFirst<T extends { scannedAt: string }>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime(),
  );
}

export const ParentTransportTab: React.FC<{ studentId?: string }> = ({
  studentId,
}) => {
  const { t } = useTranslation();
  const [selectedScan, setSelectedScan] =
    useState<TransportScanSheetEvent | TransportScanSheetGroup | null>(null);
  const q = useChildTransportSnapshot(studentId, {
    enabled: Boolean(studentId),
  });

  const scanPoints = useMemo(() => {
    return (q.data?.busScansLast7Days ?? []).filter((e) => {
      const lat = e.latitude ?? NaN;
      const lng = e.longitude ?? NaN;
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  }, [q.data?.busScansLast7Days]);

  const scanGroups = useMemo(() => {
    const groups: Array<{
      id: string;
      latitude: number;
      longitude: number;
      events: TransportScanSheetEvent[];
    }> = [];
    for (const scan of sortNewestFirst(scanPoints)) {
      const group = groups.find((candidate) =>
        candidate.events.some(
          (existing) => distanceMeters(existing, scan) <= GROUP_DISTANCE_METERS,
        ),
      );
      if (group) {
        group.events.push(scan);
        group.latitude =
          group.events.reduce((sum, event) => sum + Number(event.latitude), 0) /
          group.events.length;
        group.longitude =
          group.events.reduce((sum, event) => sum + Number(event.longitude), 0) /
          group.events.length;
      } else {
        groups.push({
          id: scan.id ?? `${scan.scannedAt}-${scan.scanKind}`,
          latitude: Number(scan.latitude),
          longitude: Number(scan.longitude),
          events: [scan],
        });
      }
    }
    return groups.map((group) => ({
      ...group,
      events: sortNewestFirst(group.events),
    }));
  }, [scanPoints]);

  const center = useMemo(() => {
    const bus = q.data?.latestPosition;
    if (bus && Number.isFinite(bus.latitude) && Number.isFinite(bus.longitude)) {
      return [bus.latitude, bus.longitude] as [number, number];
    }
    const stops = q.data?.stops ?? [];
    if (stops.length) {
      const lat = stops.reduce((s, p) => s + p.latitude, 0) / stops.length;
      const lng = stops.reduce((s, p) => s + p.longitude, 0) / stops.length;
      return [lat, lng] as [number, number];
    }
    if (scanPoints.length) {
      const lat =
        scanPoints.reduce((s, p) => s + Number(p.latitude), 0) /
        scanPoints.length;
      const lng =
        scanPoints.reduce((s, p) => s + Number(p.longitude), 0) /
        scanPoints.length;
      return [lat, lng] as [number, number];
    }
    return [-4.32, 15.32] as [number, number];
  }, [q.data, scanPoints]);

  const hasMapData = Boolean(q.data?.bus) || scanPoints.length > 0;

  function scanColor(e: { scanKind: string; isToday?: boolean }): string {
    if (e.scanKind === 'bus_pickup') return e.isToday ? '#2a6861' : '#81c784';
    return e.isToday ? '#e65100' : '#ffb74d';
  }

  return (
    <div className="rounded-xl border border-outline-variant/10 bg-white editorial-shadow overflow-hidden space-y-4 p-5 sm:p-6">
      <header className="space-y-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-on-surface-variant">
          {t('childReport.transport.label', { defaultValue: 'Transport' })}
        </p>
        <h3 className="font-serif text-xl text-primary font-semibold">
          {t('childReport.transport.title', { defaultValue: 'School bus map' })}
        </h3>
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
      ) : !hasMapData ? (
        <p className="text-sm text-on-surface/70">
          {t('childReport.transport.emptyNoBus', {
            defaultValue:
              'No bus is assigned and no transport scans were recorded in the last 7 days.',
          })}
        </p>
      ) : (
        <>
          {q.data?.bus ? (
            <div className="rounded-lg bg-surface-container-low/40 border border-outline-variant/15 p-4 space-y-1">
              <p className="font-serif text-lg font-semibold text-on-surface">
                {q.data.bus.label}
              </p>
              {q.data.bus.plateNumber ? (
                <p className="font-mono text-xs text-on-surface/60">{q.data.bus.plateNumber}</p>
              ) : null}
              <p className="font-mono text-[10px] text-on-surface-variant">
                {q.data.latestPosition
                  ? `${t('childReport.transport.lastPosition', {
                      defaultValue: 'Last bus position',
                    })} · ${formatTs(q.data.latestPosition.recordedAt)}`
                  : t('childReport.transport.noPositionYet', {
                      defaultValue: 'No GPS position recorded yet.',
                    })}
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-on-surface-variant">
            {[
              ['#2a6861', t('transport.legend.todayPickup', { defaultValue: 'Today pickup' })],
              ['#e65100', t('transport.legend.todayDrop', { defaultValue: 'Today drop-off' })],
              ['#81c784', t('transport.legend.previousPickup', { defaultValue: 'Previous pickup' })],
              ['#ffb74d', t('transport.legend.previousDrop', { defaultValue: 'Previous drop-off' })],
            ].map(([color, label]) => (
              <span key={String(label)} className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: String(color) }}
                />
                {label}
              </span>
            ))}
          </div>

          <div
            className={cn(
              'h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-outline-variant/20 z-0',
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
              {(q.data.stops ?? []).map((s) => (
                <CircleMarker
                  key={`stop-${s.sequence}-${s.name}`}
                  center={[s.latitude, s.longitude]}
                  radius={5}
                  pathOptions={{
                    color: '#757575',
                    fillColor: '#bdbdbd',
                    fillOpacity: 0.85,
                  }}
                >
                  <Popup>
                    <div className="font-mono text-[11px] space-y-1">
                      <div className="font-bold">{s.name}</div>
                      <div>
                        #{s.sequence}
                        {s.expectedTime ? ` · ${s.expectedTime}` : ''}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {q.data.latestPosition ? (
                <CircleMarker
                  key="bus-live"
                  center={[
                    q.data.latestPosition.latitude,
                    q.data.latestPosition.longitude,
                  ]}
                  radius={11}
                  pathOptions={{
                    color: '#1565c0',
                    fillColor: '#42a5f5',
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup>
                    <div className="font-mono text-[11px] space-y-1">
                      <div className="font-bold">{q.data.bus?.label ?? 'Bus'}</div>
                      <div>{formatTs(q.data.latestPosition.recordedAt)}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ) : null}
              {scanGroups.map((group, idx) => {
                const primary = group.events[0];
                const hasMultiple = group.events.length > 1;
                return (
                  <CircleMarker
                    key={`scan-group-${group.id}-${idx}`}
                    center={[group.latitude, group.longitude]}
                    radius={hasMultiple ? 11 : 8}
                    pathOptions={{
                      color: scanColor(primary),
                      fillColor: scanColor(primary),
                      fillOpacity: 0.86,
                    }}
                    eventHandlers={{
                      click: () =>
                        setSelectedScan(
                          hasMultiple ? { events: group.events } : primary,
                        ),
                    }}
                  >
                    <Popup>
                      <div className="font-mono text-[11px] space-y-1">
                        <div>
                          {hasMultiple
                            ? t('transport.bottomSheet.groupTitle', {
                                count: group.events.length,
                                defaultValue: '{{count}} nearby scans',
                              })
                            : primary.scanKind === 'bus_pickup'
                              ? t('transport.scanKind.pickup', {
                                  defaultValue: 'Bus pickup',
                                })
                              : t('transport.scanKind.drop', {
                                  defaultValue: 'Bus drop-off',
                                })}
                        </div>
                        <div>{formatTs(primary.scannedAt)}</div>
                        <div>{primary.statusRecorded}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </>
      )}
      <TransportScanBottomSheet
        event={selectedScan}
        busLabel={q.data?.bus?.label}
        onClose={() => setSelectedScan(null)}
      />
    </div>
  );
};
