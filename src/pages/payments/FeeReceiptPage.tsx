import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';
import { getParentFeeReceiptBreakdown } from '../../lib/api/client';

function money(n: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export const FeeReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const q = useQuery({
    queryKey: ['parent-fee-receipt', id],
    queryFn: () => getParentFeeReceiptBreakdown(id!),
    enabled: Boolean(id),
  });

  return (
    <Layout>
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif text-xl text-primary">
            {t('payments.receiptTitle', { defaultValue: 'Reçu de paiement' })}
          </h1>
          <Link to="/" className="text-sm text-primary underline">
            {t('payments.backHome', { defaultValue: 'Accueil' })}
          </Link>
        </div>

        {q.isLoading && (
          <p className="text-sm text-on-surface/60">
            {t('common.loading', { defaultValue: 'Chargement…' })}
          </p>
        )}
        {q.isError && (
          <p className="text-sm text-red-700">
            {(q.error as Error)?.message ?? 'Erreur'}
          </p>
        )}
        {q.data && (
          <div className="rounded-xl border border-outline-variant/20 p-4 space-y-4 bg-surface">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-on-surface/60">
                {t('payments.date', { defaultValue: 'Date' })}
              </dt>
              <dd>{q.data.date}</dd>
              <dt className="text-on-surface/60">
                {t('payments.method', { defaultValue: 'Mode' })}
              </dt>
              <dd>{q.data.method}</dd>
              {q.data.reference ? (
                <>
                  <dt className="text-on-surface/60">Réf.</dt>
                  <dd className="font-mono text-xs break-all">{q.data.reference}</dd>
                </>
              ) : null}
            </dl>
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface/50 mb-2">
                {t('payments.lines', { defaultValue: 'Détail' })}
              </p>
              <ul className="space-y-2 text-sm">
                {q.data.lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-2">
                    <span>{l.feeName}</span>
                    <span className="font-mono">{money(l.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-outline-variant/15 pt-3 flex justify-between font-semibold">
              <span>{t('payments.totalPaid', { defaultValue: 'Total payé' })}</span>
              <span>{money(q.data.totalAmount)}</span>
            </div>
            {q.data.totalRemainingDebt != null && (
              <div className="flex justify-between text-sm text-on-surface/80">
                <span>
                  {t('payments.totalRemaining', {
                    defaultValue: 'Reste à payer (tous frais)',
                  })}
                </span>
                <span className="font-mono">{money(q.data.totalRemainingDebt)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
