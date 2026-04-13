export const queryKeys = {
  children: ['parent', 'children'] as const,
  performanceReports: (studentId: string) =>
    ['parent', 'performance-reports', studentId] as const,
  analysisOverview: ['parent', 'analysis-overview'] as const,
  analysisReports: (studentId: string) =>
    ['parent', 'analysis-reports', studentId] as const,
  analysisReport: (studentId: string, reportId: string) =>
    ['parent', 'analysis-report', studentId, reportId] as const,
};
