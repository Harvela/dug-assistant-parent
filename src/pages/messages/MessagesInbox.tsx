import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';
import { loadSession } from '../../lib/auth/session';
import { cn } from '../../lib/utils';
import { useParentChildren } from '../../hooks/parentQueries';
import {
  useParentCommuniquesThreadsQuery,
  useParentCommuniquesUnreadCountQuery,
  type ParentCommuniqueThreadDto,
} from '../../hooks/parentCommuniquesQueries';
import type { ParentCommuniquesListParams } from '../../lib/query/queryKeys';
import { MessageSquare, Search, User } from 'lucide-react';

const ACCENT = [
  'bg-[#8B1538]',
  'bg-[#1A5C52]',
  'bg-[#5B7C99]',
  'bg-[#C47F08]',
  'bg-[#4A4A4A]',
] as const;

function accentForThread(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ACCENT[Math.abs(h) % ACCENT.length];
}

function formatThreadTime(iso: string | null, t: (k: string, o?: Record<string, string>) => string, locale: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfMsg.getTime()) / 86400000);
  if (diffDays === 0) {
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return t('messages.yesterday');
  if (diffDays < 7) {
    return d.toLocaleDateString(locale, { weekday: 'short' });
  }
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export type CategoryTab = 'all' | 'communiques' | 'finances' | 'academic';

function ThreadCard({
  thread,
  locale,
}: {
  thread: ParentCommuniqueThreadDto;
  locale: string;
}) {
  const { t } = useTranslation();
  const subtitle =
    thread.subject?.name ??
    thread.schoolClass?.name ??
    (thread.scopeType === 'global' ? t('messages.scopeGlobal') : null);
  const time = formatThreadTime(thread.lastMessageAt, t, locale);

  const tags: { key: string; label: string; className: string }[] = [];
  if (thread.scopeType === 'global') {
    tags.push({
      key: 'all',
      label: t('messages.tagAll'),
      className: 'bg-surface-container-high text-on-surface/70',
    });
  }
  if (thread.subject) {
    tags.push({
      key: 'acad',
      label: t('messages.tagAcademic'),
      className: 'bg-amber-100 text-amber-900',
    });
  } else if (thread.scopeType !== 'global') {
    tags.push({
      key: 'comm',
      label: t('messages.tagCommunique'),
      className: 'bg-surface-container-high text-on-surface/70',
    });
  }

  return (
    <Link
      to={`/notifications/thread/${thread.id}`}
      className="block rounded-2xl bg-white shadow-sm border border-outline-variant/15 overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div className="flex min-h-[5.5rem]">
        <div className={cn('w-1.5 shrink-0', accentForThread(thread.id))} aria-hidden />
        <div className="flex-1 p-3.5 pl-3">
          <div className="flex justify-between gap-2 items-start">
            <div className="min-w-0">
              <span className="font-semibold text-on-surface truncate block">{thread.title}</span>
              {subtitle ? (
                <p className="text-xs text-on-surface/55 mt-0.5 truncate">{subtitle}</p>
              ) : null}
            </div>
            <time className="text-[10px] font-mono uppercase tracking-wide text-on-surface/45 shrink-0">
              {time}
            </time>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag.key}
                className={cn('text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full', tag.className)}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export const MessagesInbox: React.FC = () => {
  const { t, i18n } = useTranslation();
  const session = loadSession();
  const { data: children, isLoading: childrenLoading } = useParentChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');
  const [category, setCategory] = useState<CategoryTab>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<ParentCommuniqueThreadDto[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(searchInput.trim()), 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const financeDefaultQ = i18n.language.startsWith('fr') ? 'frais' : 'fee';

  const filterParams = useMemo(() => {
    const qParam =
      debouncedQ ||
      (category === 'finances' ? financeDefaultQ : undefined) ||
      undefined;
    return {
      ...(selectedChildId !== 'all' ? { participantStudentId: selectedChildId } : {}),
      ...(category === 'academic' ? { authorRole: 'teacher' as const } : {}),
      ...(qParam ? { q: qParam } : {}),
    };
  }, [selectedChildId, category, debouncedQ, financeDefaultQ]);

  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [filterParams.participantStudentId, filterParams.q, filterParams.authorRole, category, selectedChildId]);

  const listParams = useMemo(
    (): ParentCommuniquesListParams => ({
      page,
      limit: 20,
      ...filterParams,
    }),
    [page, filterParams],
  );

  const threadsQuery = useParentCommuniquesThreadsQuery(listParams);
  const unreadQuery = useParentCommuniquesUnreadCountQuery();

  useEffect(() => {
    const rows = threadsQuery.data?.data;
    if (!rows) return;
    if (page === 1) {
      setAccumulated(rows);
      return;
    }
    setAccumulated((prev) => {
      const ids = new Set(prev.map((x) => x.id));
      const add = rows.filter((x) => !ids.has(x.id));
      return add.length ? [...prev, ...add] : prev;
    });
  }, [threadsQuery.data, page]);

  const totalPages = threadsQuery.data?.totalPages ?? 0;
  const canLoadMore = totalPages > 0 && page < totalPages;

  const categoryTabs: { id: CategoryTab; label: string }[] = [
    { id: 'all', label: t('messages.categoryAll') },
    { id: 'communiques', label: t('messages.categoryCommuniques') },
    { id: 'finances', label: t('messages.categoryFinances') },
    { id: 'academic', label: t('messages.categoryAcademic') },
  ];

  const shortEmail = useCallback((email: string) => {
    if (email.length <= 22) return email;
    const at = email.indexOf('@');
    if (at <= 2) return `${email.slice(0, 8)}…`;
    return `${email.slice(0, 10)}…${email.slice(at)}`;
  }, []);

  return (
    <Layout showTopBar={false} showBottomNav={false}>
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-outline-variant/10 pt-[calc(0.5rem+var(--spacing-safe-top))] pb-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden">
            {session?.email ? (
              <span className="text-xs font-semibold text-primary">{session.email[0]?.toUpperCase()}</span>
            ) : (
              <User className="w-5 h-5 text-on-surface/50" />
            )}
          </div>
          <h1 className="font-serif text-xl font-semibold text-primary tracking-tight flex-1 text-center">
            {t('messages.title')}
          </h1>
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors"
            aria-label={t('messages.search')}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        {searchOpen ? (
          <div className="max-w-4xl mx-auto px-0 mt-3">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('messages.searchPlaceholder')}
              className="w-full rounded-xl border border-outline-variant/25 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ) : null}
      </header>

      <div className="max-w-4xl mx-auto w-full px-4 py-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedChildId('all')}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-xs font-mono uppercase tracking-wide transition-colors',
              selectedChildId === 'all'
                ? 'bg-primary text-white'
                : 'bg-white border border-outline-variant/25 text-on-surface/80',
            )}
          >
            {t('messages.allStudents')}
          </button>
          {childrenLoading ? (
            <span className="text-xs text-on-surface/50 py-2">{t('common.loading')}</span>
          ) : (
            (children ?? []).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedChildId(c.id)}
                className={cn(
                  'shrink-0 flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border transition-colors',
                  selectedChildId === c.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-outline-variant/25 text-on-surface/80',
                )}
              >
                <span className="h-8 w-8 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                  {c.photo ? (
                    <img src={c.photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold">
                      {c.name[0]?.toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-xs font-semibold max-w-[5.5rem] truncate">{c.name}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors',
                category === tab.id
                  ? 'bg-on-surface text-white'
                  : 'bg-surface-container-high text-on-surface/70',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {category === 'finances' && !debouncedQ ? (
          <p className="text-xs text-on-surface/55">{t('messages.financeFilterHint')}</p>
        ) : null}

        {threadsQuery.error ? (
          <p className="text-sm text-red-700">{t('common.errorGeneric')}</p>
        ) : null}

        {threadsQuery.isLoading && page === 1 ? (
          <p className="text-sm text-on-surface/55 py-8 text-center">{t('common.loading')}</p>
        ) : accumulated.length === 0 && !threadsQuery.isLoading ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 py-12 text-center text-on-surface/55">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>{t('messages.empty')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {accumulated.map((thread) => (
              <li key={thread.id}>
                <ThreadCard thread={thread} locale={i18n.language} />
              </li>
            ))}
          </ul>
        )}

        {canLoadMore ? (
          <button
            type="button"
            className="w-full py-3 text-sm font-medium text-primary border border-primary/20 rounded-xl"
            onClick={() => setPage((p) => p + 1)}
            disabled={threadsQuery.isFetching}
          >
            {threadsQuery.isFetching ? t('common.loading') : t('messages.loadMore')}
          </button>
        ) : null}

        {session?.email ? (
          <p className="text-center text-[10px] text-on-surface/40 font-mono pt-2">
            {shortEmail(session.email)}
            {unreadQuery.data?.unreadThreads ? (
              <span className="ml-2 text-primary">
                · {t('messages.unreadCount', { count: unreadQuery.data.unreadThreads })}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </Layout>
  );
};
