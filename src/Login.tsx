import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginRequest, meRequest } from './lib/api/client';
import { saveSessionFromTokens } from './lib/auth/session';
import { useTranslation } from 'react-i18next';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await loginRequest(email.trim(), password);
      saveSessionFromTokens(tokens.accessToken, tokens.refreshToken);
      const me = await meRequest();
      saveSessionFromTokens(tokens.accessToken, tokens.refreshToken, {
        email: me.email,
        sub: me.id,
        roles: me.roles,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl font-semibold text-primary">
            {t('app.name', { defaultValue: 'Dug assistant' })}
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {t('auth.loginTitle', { defaultValue: 'Parent portal' })}
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 bg-surface-container-lowest p-6 rounded-xl editorial-shadow">
          {error ? (
            <p className="text-sm text-error font-mono">{error}</p>
          ) : null}
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase text-on-surface-variant" htmlFor="email">
              {t('auth.email', { defaultValue: 'Email' })}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-background px-3 py-2 text-on-surface"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase text-on-surface-variant" htmlFor="password">
              {t('auth.password', { defaultValue: 'Password' })}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-background px-3 py-2 text-on-surface"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-mono text-xs uppercase tracking-widest py-3 rounded-lg disabled:opacity-50"
          >
            {loading
              ? t('auth.signingIn', { defaultValue: 'Signing in…' })
              : t('auth.signIn', { defaultValue: 'Sign in' })}
          </button>
        </form>
      </div>
    </div>
  );
};
