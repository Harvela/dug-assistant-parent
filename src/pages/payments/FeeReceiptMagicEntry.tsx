import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { exchangeFeeReceiptLogin } from '../../lib/api/client';
import { saveSessionFromTokens } from '../../lib/auth/session';

export const FeeReceiptMagicEntry: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token?.trim()) {
      setError('Lien invalide');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const body = await exchangeFeeReceiptLogin(token.trim());
        if (cancelled) return;
        saveSessionFromTokens(body.accessToken, body.refreshToken);
        navigate(`/payments/receipt/${body.primaryFeeTransactionId}`, {
          replace: true,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Échec de la connexion');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-on-surface/70">
      Connexion…
    </div>
  );
};
