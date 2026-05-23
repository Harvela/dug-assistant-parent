import type { AnalysisReportDto } from '../../hooks/parentQueries';

export function safeNum(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

export function asString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (v == null) return null;
  return String(v);
}

export type SubjectAggregate = {
  subject: string;
  count: number | null;
  avgRatio: number | null;
  minRatio: number | null;
  maxRatio: number | null;
};

export function parseSubjectAgg(o: unknown): SubjectAggregate | null {
  const r = asRecord(o);
  if (!r) return null;
  const subject =
    asString(r.subject) ?? asString(r.subjectName) ?? asString(r.subjectCode) ?? asString(r.subjectId) ?? '—';
  return {
    subject,
    count: safeNum(r.count),
    avgRatio: safeNum(r.avgRatio),
    minRatio: safeNum(r.minRatio),
    maxRatio: safeNum(r.maxRatio),
  };
}

export type AttendanceWindow = {
  present: number | null;
  late: number | null;
  absent: number | null;
  totalRecords: number | null;
  ratePercent: number | null;
};

export function parseAttendanceWindow(o: unknown): AttendanceWindow {
  const r = asRecord(o);
  return {
    present: safeNum(r?.present),
    late: safeNum(r?.late),
    absent: safeNum(r?.absent),
    totalRecords: safeNum(r?.totalRecords),
    ratePercent: safeNum(r?.ratePercent),
  };
}

export type PupilWeeklyFactsView = {
  kind: string | null;
  frameworkVersion: string | null;
  period: { start: string; end: string } | null;
  student: {
    id?: string;
    name?: string;
    status?: string;
    className?: string;
    gradeName?: string;
    feesStatus?: string;
    attendanceRate?: number | null;
  } | null;
  academicYear: { id?: string; name?: string; startDate?: string; endDate?: string } | null;
  marksBySubject: SubjectAggregate[];
  courseEvalBySubject: SubjectAggregate[];
  strongSubjects: SubjectAggregate[];
  weakSubjects: SubjectAggregate[];
  marksSample: unknown[];
  courseEvaluationsSample: unknown[];
  finance: {
    weekPaid: number | null;
    paidInYear: number | null;
    outstandingEstimate: number | null;
    outstandingByCurrency: { USD: number; CDF: number } | null;
    expectedForGrade: number | null;
    transactionCount: number | null;
    monthlyPaidCompleted: { month: string; totalPaid: number }[];
  };
  attendanceWeek: AttendanceWindow;
  attendanceYtd: AttendanceWindow;
  conductWeekEntries: unknown[];
  conductYtdCount: number | null;
};

function mapAggList(arr: unknown): SubjectAggregate[] {
  if (!Array.isArray(arr)) return [];
  const out: SubjectAggregate[] = [];
  for (const x of arr) {
    const row = parseSubjectAgg(x);
    if (row) out.push(row);
  }
  return out;
}

export function parsePupilWeeklyFacts(factsJson: Record<string, unknown>): PupilWeeklyFactsView {
  const academic = asRecord(factsJson.academic);
  const finance = asRecord(factsJson.finance);
  const attendance = asRecord(factsJson.attendance);
  const conduct = asRecord(factsJson.conduct);
  const periodRec = asRecord(factsJson.period);
  const studentRec = asRecord(factsJson.student);
  const yearRec = asRecord(factsJson.academicYear);

  const periodStart = periodRec ? asString(periodRec.start) : null;
  const periodEnd = periodRec ? asString(periodRec.end) : null;
  const period =
    periodStart && periodEnd ? { start: periodStart, end: periodEnd } : null;

  let monthlyPaidCompleted: { month: string; totalPaid: number }[] = [];
  const mp = finance?.monthlyPaidCompleted;
  if (Array.isArray(mp)) {
    monthlyPaidCompleted = mp
      .map((x) => {
        const row = asRecord(x);
        return {
          month: asString(row?.month) ?? '',
          totalPaid: safeNum(row?.totalPaid) ?? 0,
        };
      })
      .filter((x) => x.month);
  }

  const obc = asRecord(finance?.outstandingByCurrency);
  const outstandingByCurrency =
    obc &&
    (typeof obc.USD === 'number' ||
      typeof obc.CDF === 'number' ||
      typeof obc.USD === 'string' ||
      typeof obc.CDF === 'string')
      ? {
          USD: safeNum(obc.USD) ?? 0,
          CDF: safeNum(obc.CDF) ?? 0,
        }
      : null;

  return {
    kind: asString(factsJson.kind),
    frameworkVersion: asString(factsJson.frameworkVersion),
    period,
    student: studentRec
      ? {
          id: asString(studentRec.id) ?? undefined,
          name: asString(studentRec.name) ?? undefined,
          status: asString(studentRec.status) ?? undefined,
          className: asString(studentRec.className) ?? undefined,
          gradeName: asString(studentRec.gradeName) ?? undefined,
          feesStatus: asString(studentRec.feesStatus) ?? undefined,
          attendanceRate: safeNum(studentRec.attendanceRate),
        }
      : null,
    academicYear: yearRec
      ? {
          id: asString(yearRec.id) ?? undefined,
          name: asString(yearRec.name) ?? undefined,
          startDate: asString(yearRec.startDate) ?? undefined,
          endDate: asString(yearRec.endDate) ?? undefined,
        }
      : null,
    marksBySubject: mapAggList(academic?.marksBySubject),
    courseEvalBySubject: mapAggList(academic?.courseEvalBySubject),
    strongSubjects: mapAggList(academic?.strongSubjects),
    weakSubjects: mapAggList(academic?.weakSubjects),
    marksSample: Array.isArray(academic?.marksSample) ? academic!.marksSample! : [],
    courseEvaluationsSample: Array.isArray(academic?.courseEvaluationsSample)
      ? academic!.courseEvaluationsSample!
      : [],
    finance: {
      weekPaid: safeNum(finance?.weekPaid),
      paidInYear: safeNum(finance?.paidInYear),
      outstandingEstimate: safeNum(finance?.outstandingEstimate),
      outstandingByCurrency,
      expectedForGrade: safeNum(finance?.expectedForGrade),
      transactionCount: safeNum(finance?.transactionCount),
      monthlyPaidCompleted,
    },
    attendanceWeek: parseAttendanceWindow(attendance?.analysisWeek),
    attendanceYtd: parseAttendanceWindow(attendance?.yearToDate),
    conductWeekEntries: Array.isArray(conduct?.analysisWeek) ? conduct!.analysisWeek! : [],
    conductYtdCount: safeNum(conduct?.yearToDateCount),
  };
}

export type PupilNarrativeView = {
  headline: string | null;
  confidence: string | null;
  academic: {
    summary: string | null;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    failureProbabilityPercent: number | null;
    failureProbabilityText: string | null;
  };
  finance: {
    summary: string | null;
    riskLevel: string | null;
    paymentSchemes: string[];
    proposedPaymentPlans: Array<{
      planName: string;
      description: string;
      monthlyAmount: number | null;
      durationMonths: number | null;
    }>;
  };
  presenceConduct: {
    summary: string | null;
  };
  parseError: boolean;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === 'string' ? x : x != null ? String(x) : '')).filter(Boolean);
}

export function parsePupilNarrative(narrativeJson: Record<string, unknown> | null): PupilNarrativeView {
  if (!narrativeJson) {
    return {
      headline: null,
      confidence: null,
      academic: {
        summary: null,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        failureProbabilityPercent: null,
        failureProbabilityText: null,
      },
      finance: { summary: null, riskLevel: null, paymentSchemes: [], proposedPaymentPlans: [] },
      presenceConduct: { summary: null },
      parseError: false,
    };
  }
  if (narrativeJson.parseError === true) {
    return {
      headline: null,
      confidence: null,
      academic: {
        summary: null,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        failureProbabilityPercent: null,
        failureProbabilityText: null,
      },
      finance: { summary: null, riskLevel: null, paymentSchemes: [], proposedPaymentPlans: [] },
      presenceConduct: { summary: null },
      parseError: true,
    };
  }
  const academic = asRecord(narrativeJson.academic);
  const fin = asRecord(narrativeJson.finance);
  const pc = asRecord(narrativeJson.presenceConduct);
  const plansRaw = fin?.proposedPaymentPlans;
  const proposedPaymentPlans: Array<{
    planName: string;
    description: string;
    monthlyAmount: number | null;
    durationMonths: number | null;
  }> = Array.isArray(plansRaw)
    ? plansRaw
        .map((x) => {
          const r = asRecord(x);
          if (!r) return null;
          const planName = asString(r.planName) ?? '';
          const description = asString(r.description) ?? '';
          if (!planName && !description) return null;
          return {
            planName: planName || '—',
            description,
            monthlyAmount: safeNum(r.monthlyAmount),
            durationMonths: safeNum(r.durationMonths),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
    : [];

  return {
    headline: asString(narrativeJson.headline),
    confidence: asString(narrativeJson.confidence),
    academic: {
      summary: academic ? asString(academic.summary) : null,
      strengths: academic ? asStringArray(academic.strengths) : [],
      weaknesses: academic ? asStringArray(academic.weaknesses) : [],
      recommendations: academic ? asStringArray(academic.recommendations) : [],
      failureProbabilityPercent: academic ? safeNum(academic.failureProbabilityPercent) : null,
      failureProbabilityText: academic ? asString(academic.failureProbabilityText) : null,
    },
    finance: {
      summary: fin ? asString(fin.summary) : null,
      riskLevel: fin ? asString(fin.riskLevel) : null,
      paymentSchemes: fin ? asStringArray(fin.paymentSchemes) : [],
      proposedPaymentPlans,
    },
    presenceConduct: {
      summary: pc ? asString(pc.summary) : null,
    },
    parseError: false,
  };
}

export type InsightCard = {
  title: string;
  detail: string;
  severity: string;
  metricKey?: string;
};

export function parseInsights(insightsJson: unknown): InsightCard[] {
  if (!Array.isArray(insightsJson)) return [];
  const out: InsightCard[] = [];
  for (const item of insightsJson) {
    const r = asRecord(item);
    if (!r) continue;
    const title = asString(r.title) ?? '';
    const detail = asString(r.detail) ?? '';
    if (!title && !detail) continue;
    out.push({
      title,
      detail,
      severity: asString(r.severity) ?? 'info',
      metricKey: asString(r.metricKey) ?? undefined,
    });
  }
  return out;
}

export type ParsedPupilWeeklyReport = {
  facts: PupilWeeklyFactsView;
  narrative: PupilNarrativeView;
  insights: InsightCard[];
  looksLikePupilWeekly: boolean;
};

export function parsePupilWeeklyReport(report: AnalysisReportDto): ParsedPupilWeeklyReport {
  const facts = parsePupilWeeklyFacts(report.factsJson ?? {});
  const narrative = parsePupilNarrative(report.narrativeJson);
  const insights = parseInsights(report.insightsJson);
  const looksLikePupilWeekly =
    facts.kind === 'pupil_weekly_facts' ||
    (facts.student != null && (facts.attendanceWeek.totalRecords != null || facts.marksBySubject.length > 0));

  return { facts, narrative, insights, looksLikePupilWeekly };
}

export function dedupeSubjectsByName(rows: SubjectAggregate[]): SubjectAggregate[] {
  const m = new Map<string, SubjectAggregate>();
  for (const r of rows) {
    const prev = m.get(r.subject);
    if (!prev) {
      m.set(r.subject, r);
      continue;
    }
    const a = r.avgRatio;
    const b = prev.avgRatio;
    if (a != null && (b == null || a > b)) m.set(r.subject, r);
  }
  return [...m.values()];
}

export function bestWorstSubject(rows: SubjectAggregate[]): {
  best: SubjectAggregate | null;
  worst: SubjectAggregate | null;
} {
  const withRatio = rows.filter((r) => r.avgRatio != null);
  if (!withRatio.length) return { best: null, worst: null };
  let best = withRatio[0]!;
  let worst = withRatio[0]!;
  for (const r of withRatio) {
    if (r.avgRatio! > best.avgRatio!) best = r;
    if (r.avgRatio! < worst.avgRatio!) worst = r;
  }
  return { best, worst };
}

export type PrimaryAlert = {
  kind: 'fees' | 'attendance' | 'academics' | 'none';
  severity: 'urgent' | 'watch' | 'ok';
  title: string;
  detail: string;
  cta?: { label: string; action: 'pay' | 'tutor' | 'contact' };
};

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function statusLabelFromSignals(signals: {
  attendanceWeekRatePercent: number | null;
  weakSubjectCount: number;
  outstandingEstimate: number | null;
}): { severity: 'ok' | 'watch' | 'urgent'; labelKey: 'stable' | 'watch' | 'needs_attention' } {
  const weak = signals.weakSubjectCount > 0;
  const lowAttendance = signals.attendanceWeekRatePercent != null && signals.attendanceWeekRatePercent < 85;
  const feesDue = signals.outstandingEstimate != null && signals.outstandingEstimate > 0;

  if (feesDue || (weak && lowAttendance)) return { severity: 'urgent', labelKey: 'needs_attention' };
  if (weak || lowAttendance) return { severity: 'watch', labelKey: 'watch' };
  return { severity: 'ok', labelKey: 'stable' };
}

export function primaryAlertFromParsed(parsed: ParsedPupilWeeklyReport): PrimaryAlert {
  const outstanding = parsed.facts.finance.outstandingEstimate;
  const riskLevel = (parsed.narrative.finance.riskLevel ?? '').toLowerCase();
  const att = parsed.facts.attendanceWeek.ratePercent;
  const weak = parsed.facts.weakSubjects.filter((s) => (s.avgRatio ?? 100) < 60);

  // 1) Fees, if due or explicitly high risk.
  if ((outstanding != null && outstanding > 0) || riskLevel === 'high') {
    return {
      kind: 'fees',
      severity: outstanding != null && outstanding > 0 ? 'urgent' : 'watch',
      title: 'fees_due',
      detail:
        outstanding != null && outstanding > 0
          ? `Outstanding estimate: ${outstanding}`
          : parsed.narrative.finance.summary ?? '',
      cta: { label: 'pay_now', action: 'pay' },
    };
  }

  // 2) Attendance, if low.
  if (att != null && att < 90) {
    return {
      kind: 'attendance',
      severity: att < 85 ? 'urgent' : 'watch',
      title: 'attendance_drop',
      detail: `Attendance this week: ${Math.round(att)}%`,
      cta: { label: 'contact_school', action: 'contact' },
    };
  }

  // 3) Academics, if weak subjects exist.
  if (weak.length) {
    const top = weak[0]!;
    return {
      kind: 'academics',
      severity: (top.avgRatio ?? 100) < 50 ? 'urgent' : 'watch',
      title: 'support_subjects',
      detail: `${top.subject}: ${Math.round(clampPct(top.avgRatio ?? 0))}%`,
      cta: { label: 'plan_tutoring', action: 'tutor' },
    };
  }

  return {
    kind: 'none',
    severity: 'ok',
    title: 'all_good',
    detail: parsed.narrative.headline ?? '',
  };
}

export function supportSubjectsRows(parsed: ParsedPupilWeeklyReport, limit = 3): Array<{
  subject: string;
  ratio: number | null;
  tone: 'good' | 'watch' | 'bad';
}> {
  const rows = parsed.facts.weakSubjects
    .filter((r) => r.subject)
    .map((r) => {
      const ratio = r.avgRatio != null ? clampPct(r.avgRatio) : null;
      const tone: 'good' | 'watch' | 'bad' =
        ratio == null ? 'watch' : ratio < 50 ? 'bad' : ratio < 65 ? 'watch' : 'good';
      return { subject: r.subject, ratio, tone };
    })
    .slice(0, limit);
  return rows;
}

export function paymentTimelineRows(parsed: ParsedPupilWeeklyReport, limit = 3): Array<{
  label: string;
  dateHint: string | null;
  amount: number;
  status: 'paid' | 'pending';
}> {
  const rows: Array<{
    label: string;
    dateHint: string | null;
    amount: number;
    status: 'paid' | 'pending';
  }> = parsed.facts.finance.monthlyPaidCompleted
    .slice(0, limit)
    .map((m) => ({
      label: m.month,
      dateHint: null,
      amount: m.totalPaid,
      status: 'paid' as const,
    }));

  const outstanding = parsed.facts.finance.outstandingEstimate;
  if (outstanding != null && outstanding > 0) {
    rows.push({
      label: 'Outstanding',
      dateHint: null,
      amount: outstanding,
      status: 'pending' as const,
    });
  }

  return rows.slice(0, limit);
}

