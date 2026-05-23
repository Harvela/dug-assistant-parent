/** Mirrors API shapes from school-erp for parent Live snapshot views. */

export type ParentFinanceLineDto = {
  feeId: string;
  name: string;
  category?: string;
  billingMode?: string;
  monthlyAmount?: number | null;
  monthsInYear?: number;
  annualExpected?: number;
  paidInYear?: number;
  remaining: number;
  expectedThroughAsOf?: number;
  currency?: 'USD' | 'CDF';
};

export type ParentFinanceDebtByCurrencyDto = {
  USD: number;
  CDF: number;
};

export type ParentFinanceSnapshotDto = {
  lines: ParentFinanceLineDto[];
  totalDebtByCurrency: ParentFinanceDebtByCurrencyDto;
  totalDebt: number;
  legacyApprox: boolean;
  monthsInYear: number;
  personnelDiscountEligible?: boolean;
};

export type ParentBulletinSubjectRowDto = {
  subjectName: string;
  totalsGeneral: {
    percentage: number | null;
  };
};

export type ParentBulletinStudentDto = {
  yearPercentage: number | null;
};

export type ParentBulletinAggregatesDto = {
  grandPercentage: number | null;
};

export type ParentYearBulletinGridDto = {
  academicYear: string;
  className: string;
  gradeName: string;
  subjects: ParentBulletinSubjectRowDto[];
  student: ParentBulletinStudentDto;
  aggregates: ParentBulletinAggregatesDto;
};
