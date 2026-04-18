import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MoreVertical, Send } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { loadSession } from '../../lib/auth/session';
import { cn } from '../../lib/utils';
import { useParentChildren } from '../../hooks/parentQueries';
import {
  useParentCommuniqueThreadQuery,
  useParentCommuniquesMessagesQuery,
  useParentMarkThreadReadMutation,
  useParentSendCommuniqueMessageMutation,
  type ParentCommuniqueMessageDto,
} from '../../hooks/parentCommuniquesQueries';

function formatMsgTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

function displayAuthor(m: ParentCommuniqueMessageDto): string {
  if (m.authorUser?.email) {
    const e = m.authorUser.email;
    const at = e.indexOf('@');
    if (at > 1) return e.slice(0, at);
    return e;
  }
  return '…';
}

export const ThreadConversation: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const session = loadSession();
  const [body, setBody] = useState('');

  const threadQuery = useParentCommuniqueThreadQuery(threadId);
  const messagesQuery = useParentCommuniquesMessagesQuery(threadId);
  const { data: children } = useParentChildren();
  const { mutate: markReadMutate } = useParentMarkThreadReadMutation();
  const sendMutation = useParentSendCommuniqueMessageMutation(threadId);

  useEffect(() => {
    if (!threadId) return;
    const key = `dug_parent_markread:${threadId}`;
    const now = Date.now();
    const prev = Number(sessionStorage.getItem(key) ?? '0');
    if (now - prev < 8000) return;
    sessionStorage.setItem(key, String(now));
    markReadMutate(threadId);
  }, [threadId, markReadMutate]);

  const thread = threadQuery.data;
  const messages = messagesQuery.data ?? [];

  const headerSubtitle = useMemo(() => {
    if (!thread) return '';
    if (thread.schoolClass?.name) return thread.schoolClass.name;
    if (thread.subject?.name) return thread.subject.name;
    return thread.scopeType === 'global' ? t('messages.scopeGlobal') : '';
  }, [thread, t]);

  const relatedChildName = useMemo(() => {
    if (!thread || !children?.length) return null;
    if (thread.scopeType === 'class' && thread.classId) {
      const inClass = children.filter((c) => c.classId === thread.classId);
      if (inClass.length === 1) return inClass[0].name;
      if (inClass.length > 1) return t('messages.multipleChildrenClass');
    }
    if (thread.scopeType === 'student_group') {
      if (children.length === 1) return children[0].name;
      return t('messages.studentGroup');
    }
    if (thread.scopeType === 'global') return t('messages.tagAll');
    return null;
  }, [thread, children, t]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || !threadId) return;
    try {
      await sendMutation.mutateAsync(text);
      setBody('');
    } catch {
      /* toast optional */
    }
  };

  if (!threadId) {
    return null;
  }

  return (
    <Layout showTopBar={false} showBottomNav={false}>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-outline-variant/10 pt-[calc(0.5rem+var(--spacing-safe-top))] pb-3 px-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full text-primary hover:bg-primary/10"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {threadQuery.isLoading ? (
              <p className="text-sm text-on-surface/50">{t('common.loading')}</p>
            ) : thread ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-semibold text-on-surface truncate">{thread.title}</h1>
                  {relatedChildName ? (
                    <span className="text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface/70 shrink-0">
                      {relatedChildName}
                    </span>
                  ) : null}
                </div>
                {headerSubtitle ? (
                  <p className="text-xs text-on-surface/50 truncate">{headerSubtitle}</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-on-surface/50">{t('messages.threadNotFound')}</p>
            )}
          </div>
          <button type="button" className="p-2 text-on-surface/40" aria-hidden>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-3 py-4 flex flex-col min-h-[50vh]">
        {messagesQuery.error ? (
          <p className="text-sm text-red-700">{t('common.errorGeneric')}</p>
        ) : messagesQuery.isLoading ? (
          <p className="text-sm text-on-surface/55 py-8 text-center">{t('common.loading')}</p>
        ) : (
          <ul className="space-y-3 flex-1 pb-24">
            {messages.map((m) => {
              const mine = session?.sub && m.authorUserId === session.sub;
              return (
                <li
                  key={m.id}
                  className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm',
                      mine ? 'bg-primary text-white rounded-br-md' : 'bg-surface-container-high text-on-surface rounded-bl-md',
                    )}
                  >
                    {!mine ? (
                      <p className="text-[10px] font-mono uppercase tracking-wide text-on-surface/45 mb-1">
                        {displayAuthor(m)}
                      </p>
                    ) : null}
                    <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={cn(
                        'text-[10px] mt-1.5 font-mono',
                        mine ? 'text-white/70 text-right' : 'text-on-surface/40',
                      )}
                    >
                      {formatMsgTime(m.createdAt, i18n.language)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="fixed bottom-[calc(1rem+var(--spacing-safe-bottom))] left-0 right-0 px-3 max-w-4xl mx-auto w-full z-30">
          <div className="flex items-end gap-2 rounded-2xl border border-outline-variant/20 bg-white/95 backdrop-blur p-2 shadow-lg">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('messages.writeReply')}
              rows={1}
              className="flex-1 resize-none max-h-32 rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25 bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!body.trim() || sendMutation.isPending}
              className="shrink-0 h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40"
              aria-label={t('messages.send')}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
