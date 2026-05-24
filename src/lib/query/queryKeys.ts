export type ParentCommuniquesListParams = {
  page?: number;
  limit?: number;
  q?: string;
  scopeType?: 'global' | 'class' | 'student_group';
  subjectId?: string;
  classId?: string;
  participantStudentId?: string;
  authorRole?: 'parent' | 'teacher' | 'student';
};

export const queryKeys = {
  children: ['parent', 'children'] as const,
  performanceReports: (studentId: string) =>
    ['parent', 'performance-reports', studentId] as const,
  analysisOverview: ['parent', 'analysis-overview'] as const,
  analysisReports: (studentId: string) =>
    ['parent', 'analysis-reports', studentId] as const,
  analysisReport: (studentId: string, reportId: string) =>
    ['parent', 'analysis-report', studentId, reportId] as const,
  academicYears: ['parent', 'academic-years'] as const,
  financeSnapshot: (studentId: string, academicYearId: string, asOf: string) =>
    ['parent', 'finance-snapshot', studentId, academicYearId, asOf] as const,
  academicProgress: (studentId: string, academicYearId: string) =>
    ['parent', 'academic-progress', studentId, academicYearId] as const,
  attendanceDaily: (studentId: string, day: string) =>
    ['parent', 'attendance-daily', studentId, day] as const,
  transportSnapshot: (studentId: string) =>
    ['parent', 'student-transport', studentId] as const,
  attendanceReport: (studentId: string, from: string, to: string) =>
    ['parent', 'attendance-report-range', studentId, from, to] as const,
  parentCommuniques: {
    threads: (p: ParentCommuniquesListParams) => ['parent', 'communiques', 'threads', p] as const,
    messages: (threadId: string) => ['parent', 'communiques', 'messages', threadId] as const,
    unreadCount: ['parent', 'communiques', 'unread-count'] as const,
  },
};
