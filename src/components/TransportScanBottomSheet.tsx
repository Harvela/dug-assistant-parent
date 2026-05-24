import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export type TransportScanSheetEvent = {
  scannedAt: string;
  scanKind: string;
  statusRecorded: string;
  latitude: number | null;
  longitude: number | null;
  isToday: boolean;
};

export type TransportScanSheetGroup = {
  events: TransportScanSheetEvent[];
};

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function TransportScanBottomSheet({
  event,
  busLabel,
  onClose,
}: {
  event: TransportScanSheetEvent | TransportScanSheetGroup | null;
  busLabel?: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!event) return null;
  const events = 'events' in event ? event.events : [event];
  const primary = events[0];
  const pickup = primary.scanKind === 'bus_pickup';
  const hasMultiple = events.length > 1;
  return (
    <div className="fixed inset-0 z-[999999999] flex items-end justify-center bg-black/20">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t('transport.bottomSheet.close', { defaultValue: 'Close' })}
        onClick={onClose}
      />
      <section className="relative w-full max-w-lg rounded-t-2xl border border-outline-variant/15 bg-white p-5 shadow-2xl">
        <div className="flex justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-on-surface-variant">
              {primary.isToday
                ? t('transport.bottomSheet.today', { defaultValue: 'Today' })
                : t('transport.bottomSheet.previous', {
                    defaultValue: 'Previous scan',
                  })}
            </p>
            <h3 className="font-serif text-xl font-semibold text-primary">
              {hasMultiple
                ? t('transport.bottomSheet.groupTitle', {
                    count: events.length,
                    defaultValue: '{{count}} nearby scans',
                  })
                : pickup
                  ? t('transport.scanKind.pickup', {
                      defaultValue: 'Bus pickup',
                    })
                  : t('transport.scanKind.drop', {
                      defaultValue: 'Bus drop-off',
                    })}
            </h3>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
            onClick={onClose}
            aria-label={t('transport.bottomSheet.close', {
              defaultValue: 'Close',
            })}
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {events.map((scan, idx) => {
            const isPickup = scan.scanKind === 'bus_pickup';
            return (
              <dl
                key={`${scan.scannedAt}-${scan.scanKind}-${idx}`}
                className="rounded-xl border border-outline-variant/15 bg-surface-container-low/40 p-3 text-sm"
              >
                <div className="flex justify-between gap-3">
                  <dt className="font-serif font-semibold text-primary">
                    {isPickup
                      ? t('transport.scanKind.pickup', {
                          defaultValue: 'Bus pickup',
                        })
                      : t('transport.scanKind.drop', {
                          defaultValue: 'Bus drop-off',
                        })}
                  </dt>
                  <dd className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {scan.isToday
                      ? t('transport.bottomSheet.today', { defaultValue: 'Today' })
                      : t('transport.bottomSheet.previous', {
                          defaultValue: 'Previous scan',
                        })}
                  </dd>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <dt className="text-on-surface-variant">
                    {t('transport.bottomSheet.time', { defaultValue: 'Time' })}
                  </dt>
                  <dd className="font-mono text-right">{formatTs(scan.scannedAt)}</dd>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <dt className="text-on-surface-variant">
                    {t('transport.bottomSheet.status', { defaultValue: 'Status' })}
                  </dt>
                  <dd className="font-mono text-right">{scan.statusRecorded}</dd>
                </div>
              </dl>
            );
          })}
          {busLabel ? (
            <div className="flex justify-between gap-3">
              <dt className="text-on-surface-variant">
                {t('transport.bottomSheet.bus', { defaultValue: 'Bus' })}
              </dt>
              <dd className="font-mono text-right">{busLabel}</dd>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
