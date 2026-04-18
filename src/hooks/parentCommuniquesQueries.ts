import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiJson, apiVoid } from '../lib/api/client';
import type { PaginatedResult } from './parentQueries';
import { queryKeys, type ParentCommuniquesListParams } from '../lib/query/queryKeys';

export type CommuniqueScopeType = 'global' | 'class' | 'student_group';

export type ParentCommuniqueThreadDto = {
  id: string;
  title: string;
  scopeType: CommuniqueScopeType;
  classId: string | null;
  subjectId: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  schoolClass?: { id: string; name: string } | null;
  subject?: { id: string; name: string; code: string } | null;
};

export type ParentCommuniqueMessageDto = {
  id: string;
  threadId: string;
  body: string;
  authorUserId: string | null;
  authorStudentId: string | null;
  createdAt: string;
  authorUser?: {
    id: string;
    email: string;
    roles?: { name: string }[];
  } | null;
};

function qs(p: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

function listParamsToQuery(p: ParentCommuniquesListParams): Record<string, string | number | undefined> {
  return {
    page: p.page,
    limit: p.limit ?? 20,
    q: p.q,
    scopeType: p.scopeType,
    subjectId: p.subjectId,
    classId: p.classId,
    participantStudentId: p.participantStudentId,
    authorRole: p.authorRole,
  };
}

export function useParentCommuniquesThreadsQuery(
  params: ParentCommuniquesListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.parentCommuniques.threads(params),
    queryFn: () =>
      apiJson<PaginatedResult<ParentCommuniqueThreadDto>>(
        `/parent/communiques/threads${qs(listParamsToQuery(params))}`,
      ),
    enabled: options?.enabled !== false,
  });
}

export function useParentCommuniquesMessagesQuery(
  threadId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.parentCommuniques.messages(threadId ?? ''),
    queryFn: () =>
      apiJson<ParentCommuniqueMessageDto[]>(
        `/parent/communiques/threads/${threadId}/messages`,
      ),
    enabled: Boolean(threadId) && options?.enabled !== false,
  });
}

export function useParentCommuniquesUnreadCountQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.parentCommuniques.unreadCount,
    queryFn: () => apiJson<{ unreadThreads: number }>('/parent/communiques/unread-count'),
    enabled: options?.enabled !== false,
    refetchInterval: 60_000,
  });
}

export function useParentCommuniqueThreadQuery(
  threadId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['parent', 'communiques', 'thread', threadId ?? ''] as const,
    queryFn: () =>
      apiJson<ParentCommuniqueThreadDto>(`/parent/communiques/threads/${threadId}`),
    enabled: Boolean(threadId) && options?.enabled !== false,
  });
}

export function useParentMarkThreadReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) =>
      apiVoid(`/parent/communiques/threads/${threadId}/read`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.parentCommuniques.unreadCount });
      void qc.invalidateQueries({ queryKey: ['parent', 'communiques', 'threads'] });
    },
  });
}

export function useParentSendCommuniqueMessageMutation(threadId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => {
      if (!threadId) throw new Error('Missing thread id');
      return apiJson<ParentCommuniqueMessageDto>(
        `/parent/communiques/threads/${threadId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body }),
        },
      );
    },
    onSuccess: () => {
      if (threadId) {
        void qc.invalidateQueries({ queryKey: queryKeys.parentCommuniques.messages(threadId) });
        void qc.invalidateQueries({ queryKey: ['parent', 'communiques', 'thread', threadId] });
      }
      void qc.invalidateQueries({ queryKey: ['parent', 'communiques', 'threads'] });
      void qc.invalidateQueries({ queryKey: queryKeys.parentCommuniques.unreadCount });
    },
  });
}
