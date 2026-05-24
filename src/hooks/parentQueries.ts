import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '../lib/api/client';
import { queryKeys } from '../lib/query/queryKeys';
import type {
  ParentFinanceSnapshotDto,
  ParentYearBulletinGridDto,
} from '../types/liveSnapshot';

export type ParentChildDto = {
  id: string;
  name: string;
  photo: string | null;
  classId: string;
  status: string;
  feesStatus: string;
  attendanceRate: string | null;
  className?: string;
  gradeName?: string;
  transportBusId?: string | null;
};

export type PerformanceReportDto = {
  id: string;
  studentId: string;
  academicYearId: string | null;
  trigger: string;
  model: string;
  summary: string | null;
  sections: Record<string, unknown>;
  createdAt: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AnalysisKind = 'pupil_weekly' | 'finance_weekly';

export type AnalysisReportDto = {
  id: string;
  analysisKind: AnalysisKind;
  studentId: string | null;
  classId: string | null;
  academicYearId: string | null;
  periodStart: string;
  periodEnd: string;
  status: string;
  trigger: string;
  factsJson: Record<string, unknown>;
  narrativeJson: Record<string, unknown> | null;
  insightsJson: unknown[];
  summaryMarkdown: string | null;
  createdAt: string;
};

export type ParentAnalysisOverviewItem = {
  studentId: string;
  studentName: string;
  className: string | null;
  gradeName: string | null;
  reportId: string | null;
  updatedAt: string | null;
  outstandingEstimate: number | null;
  attendanceWeekRatePercent: number | null;
  failureProbabilityPercent: number | null;
  failureProbabilityText: string | null;
  weakSubjects: Array<{ subject: string; avgRatio: number | null }>;
  topActions: string[];
  severity: 'ok' | 'watch' | 'urgent';
};

export type ParentAnalysisOverviewDto = {
  updatedAt: string | null;
  summary: string;
  urgentCount: number;
  watchCount: number;
  items: ParentAnalysisOverviewItem[];
};

export function useParentChildren() {
  return useQuery({
    queryKey: queryKeys.children,
    queryFn: () => apiJson<ParentChildDto[]>('/parent/me/children'),
  });
}

export function useParentAnalysisOverview() {
  return useQuery({
    queryKey: queryKeys.analysisOverview,
    queryFn: () => apiJson<ParentAnalysisOverviewDto>('/parent/me/analysis-overview'),
  });
}

export function useChildAnalysisReports(
  studentId: string | undefined,
  page = 1,
  limit = 20,
  options?: { enabled?: boolean },
) {
  const enabledOuter = options?.enabled !== false;
  return useQuery({
    queryKey: [...queryKeys.analysisReports(studentId ?? ''), page, limit],
    queryFn: () =>
      apiJson<PaginatedResult<AnalysisReportDto>>(
        `/parent/students/${studentId}/analysis-reports?page=${page}&limit=${limit}`,
      ),
    enabled: Boolean(studentId) && enabledOuter,
  });
}

export function useChildAnalysisReport(
  studentId: string | undefined,
  reportId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabledOuter = options?.enabled !== false;
  return useQuery({
    queryKey: queryKeys.analysisReport(studentId ?? '', reportId ?? ''),
    queryFn: () =>
      apiJson<AnalysisReportDto>(
        `/parent/students/${studentId}/analysis-reports/${reportId}`,
      ),
    enabled: Boolean(studentId && reportId) && enabledOuter,
  });
}

export type ParentAcademicYearListItem = {
  id: string;
  name: string;
  isActive?: boolean;
};

export function useParentAcademicYearsQuery() {
  return useQuery({
    queryKey: queryKeys.academicYears,
    queryFn: () => apiJson<ParentAcademicYearListItem[]>('/parent/academic-years'),
  });
}

export type ParentAttendanceDailyDto = {
  day: string;
  arrivalTime: string | null;
  exitTime: string | null;
  transportPoints: Array<{
    kind: string;
    scannedAt: string;
    latitude: number;
    longitude: number;
  }>;
  events: Array<{
    scannedAt: string;
    scanKind: string;
    statusRecorded: string;
    latitude: number | null;
    longitude: number | null;
  }>;
};

export function useChildAttendanceDaily(
  studentId: string | undefined,
  day: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled =
    Boolean(studentId && day) && (options?.enabled !== false);
  const qs = day ? `?day=${encodeURIComponent(day)}` : '';
  return useQuery({
    queryKey: queryKeys.attendanceDaily(studentId ?? '', day ?? ''),
    queryFn: () =>
      apiJson<ParentAttendanceDailyDto>(
        `/parent/students/${studentId}/attendance-daily${qs}`,
      ),
    enabled,
    staleTime: 60_000,
  });
}

export function useChildFinanceSnapshot(
  studentId: string | undefined,
  academicYearId: string | undefined,
  asOf: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const qs = new URLSearchParams();
  if (academicYearId) qs.set('academicYearId', academicYearId);
  if (asOf) qs.set('asOf', asOf);
  const qstr = qs.toString();
  return useQuery({
    queryKey: queryKeys.financeSnapshot(
      studentId ?? '',
      academicYearId ?? '',
      asOf ?? '',
    ),
    queryFn: () =>
      apiJson<ParentFinanceSnapshotDto>(
        `/parent/students/${studentId}/finance-snapshot${qstr ? `?${qstr}` : ''}`,
      ),
    enabled: Boolean(studentId && academicYearId) && enabled,
  });
}

export function useChildAcademicProgress(
  studentId: string | undefined,
  academicYearId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const qs = new URLSearchParams();
  if (academicYearId) qs.set('academicYearId', academicYearId);
  return useQuery({
    queryKey: queryKeys.academicProgress(studentId ?? '', academicYearId ?? ''),
    queryFn: () =>
      apiJson<ParentYearBulletinGridDto>(
        `/parent/students/${studentId}/academic-progress?${qs.toString()}`,
      ),
    enabled: Boolean(studentId && academicYearId) && enabled,
  });
}

export function usePerformanceReports(studentId: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.performanceReports(studentId ?? ''), page, limit],
    queryFn: () =>
      apiJson<PaginatedResult<PerformanceReportDto>>(
        `/parent/students/${studentId}/performance-reports?page=${page}&limit=${limit}`,
      ),
    enabled: Boolean(studentId),
  });
}

export function useGeneratePerformanceReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      apiJson<PerformanceReportDto>(
        `/parent/students/${studentId}/performance-reports/generate`,
        { method: 'POST' },
      ),
    onSuccess: (_data, studentId) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.performanceReports(studentId),
      });
      void qc.invalidateQueries({ queryKey: queryKeys.analysisOverview });
    },
  });
}

export type ParentTransportSnapshotDto = {
  bus: { id: string; label: string; plateNumber: string | null } | null;
  stops: Array<{
    sequence: number;
    name: string;
    latitude: number;
    longitude: number;
    expectedTime: string | null;
  }>;
  latestPosition: {
    latitude: number;
    longitude: number;
    recordedAt: string;
  } | null;
  busScansToday: Array<{
    id?: string;
    scannedAt: string;
    scanKind: string;
    statusRecorded: string;
    latitude: number | null;
    longitude: number | null;
  }>;
  busScansLast7Days: Array<{
    id: string;
    scannedAt: string;
    scanKind: string;
    statusRecorded: string;
    latitude: number | null;
    longitude: number | null;
    day: string;
    isToday: boolean;
  }>;
};

export type ParentAttendanceReportDto = {
  from: string;
  to: string;
  days: ParentAttendanceDailyDto[];
};

/** Live-ish bus itinerary + telemetry for parent's child (staff-assigned bus). */
export function useChildTransportSnapshot(
  studentId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  return useQuery({
    queryKey: queryKeys.transportSnapshot(studentId ?? ''),
    queryFn: () =>
      apiJson<ParentTransportSnapshotDto>(
        `/parent/students/${studentId}/transport`,
      ),
    enabled: Boolean(studentId) && enabled,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

/** Multi-day scan timeline (`from`/`to` optional — server defaults to last 7 days). */
export function useChildAttendanceReport(
  studentId: string | undefined,
  from: string | undefined,
  to: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const qs = new URLSearchParams();
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const suf = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery({
    queryKey: queryKeys.attendanceReport(
      studentId ?? '',
      from ?? '',
      to ?? '',
    ),
    queryFn: () =>
      apiJson<ParentAttendanceReportDto>(
        `/parent/students/${studentId}/attendance-report${suf}`,
      ),
    enabled: Boolean(studentId) && enabled,
    staleTime: 60_000,
  });
}

export function sectionSummary(
  sections: Record<string, unknown> | undefined,
  key: string,
): string {
  if (!sections) return '';
  const block = sections[key];
  if (block && typeof block === 'object' && block !== null && 'summary' in block) {
    return String((block as { summary: unknown }).summary ?? '');
  }
  return '';
}
