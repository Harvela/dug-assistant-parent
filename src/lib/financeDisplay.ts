import type { ParentFinanceSnapshotDto } from '../types/liveSnapshot';

export function formatParentFinanceDebt(
  s: ParentFinanceSnapshotDto | undefined,
): string {
  const amount = s?.totalDebtByCurrency?.USD ?? s?.totalDebt ?? 0;
  if (s != null && typeof amount === 'number' && amount > 0.005) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
  return '—';
}
