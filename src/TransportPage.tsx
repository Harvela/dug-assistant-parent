import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { ParentTransportTab } from './components/ParentTransportTab';
import { useParentChildren } from './hooks/parentQueries';

export const TransportPage: React.FC = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { studentId: routeStudentId } = useParams<{ studentId?: string }>();
  const { data: children = [], isLoading, error } = useParentChildren();

  const selectedId = useMemo(() => {
    if (routeStudentId && children.some((c) => c.id === routeStudentId)) {
      return routeStudentId;
    }
    return children[0]?.id;
  }, [routeStudentId, children]);

  useEffect(() => {
    if (!selectedId || routeStudentId === selectedId) return;
    if (children.length > 0 && !routeStudentId) {
      nav(`/transport/${selectedId}`, { replace: true });
    }
  }, [selectedId, routeStudentId, children.length, nav]);

  const child = children.find((c) => c.id === selectedId);

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
        <header className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-on-surface-variant">
            {t('transport.page.kicker', { defaultValue: 'School transport' })}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
            {t('nav.transport', { defaultValue: 'Transport' })}
          </h2>
          <p className="text-on-surface-variant text-sm max-w-lg">
            {t('transport.page.subtitle', {
              defaultValue: 'Live bus position and today’s pickup scans for your children.',
            })}
          </p>
        </header>

        {isLoading ? (
          <p className="font-mono text-xs text-on-surface-variant">
            {t('common.loading', { defaultValue: 'Loading…' })}
          </p>
        ) : error ? (
          <p className="font-mono text-xs text-error">
            {(error as Error)?.message ??
              t('common.errorGeneric', { defaultValue: 'Something went wrong' })}
          </p>
        ) : children.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/10 bg-white p-6 space-y-3">
            <p className="text-sm text-on-surface/70">
              {t('transport.page.noChildren', {
                defaultValue: 'No children linked to your account yet.',
              })}
            </p>
            <Link
              to="/children"
              className="inline-block font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
            >
              {t('common.viewChildren', { defaultValue: 'View children' })}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block space-y-1 max-w-md">
              <span className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
                {t('transport.page.pickChild', { defaultValue: 'Child' })}
              </span>
              <select
                value={selectedId ?? ''}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) nav(`/transport/${id}`);
                }}
                className="w-full rounded-xl border border-outline-variant/20 bg-white px-3 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.gradeName ? ` · ${c.gradeName}` : ''}
                  </option>
                ))}
              </select>
            </label>

            {child ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface/50">
                {[child.className, child.gradeName].filter(Boolean).join(' · ') || '—'}
              </p>
            ) : null}

            <ParentTransportTab studentId={selectedId} />
          </div>
        )}
      </div>
    </Layout>
  );
};
