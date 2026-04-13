import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '../lib/api/client';
import { queryKeys } from '../lib/query/queryKeys';

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
) {
  return useQuery({
    queryKey: [...queryKeys.analysisReports(studentId ?? ''), page, limit],
    queryFn: () =>
      apiJson<PaginatedResult<AnalysisReportDto>>(
        `/parent/students/${studentId}/analysis-reports?page=${page}&limit=${limit}`,
      ),
    enabled: Boolean(studentId),
  });
}

export function useChildAnalysisReport(
  studentId: string | undefined,
  reportId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.analysisReport(studentId ?? '', reportId ?? ''),
    queryFn: () =>
      apiJson<AnalysisReportDto>(
        `/parent/students/${studentId}/analysis-reports/${reportId}`,
      ),
    enabled: Boolean(studentId && reportId),
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
