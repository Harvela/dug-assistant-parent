import { useEffect, useState } from 'react';
import { Bell, Download } from 'lucide-react';
import { fetchVapidPublicKey, subscribePushNotifications } from '../lib/api/client';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function EnableNotificationsDialog() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const detectInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone));

  useEffect(() => {
    const installed = detectInstalled();
    setIsInstalled(installed);
    const shouldShowInstall =
      !installed && localStorage.getItem('pwa_install_prompt_parent') !== 'installed';
    const shouldShowNotifications =
      'Notification' in window &&
      Notification.permission === 'default' &&
      localStorage.getItem('push_prompt_parent') !== 'dismissed';
    if (shouldShowInstall || shouldShowNotifications) {
      setVisible(true);
    }
    const onBeforeInstallPrompt = (event: Event) => {
      setInstallPrompt(event as BeforeInstallPromptEvent);
      if (localStorage.getItem('pwa_install_prompt_parent') !== 'installed') {
        setVisible(true);
      }
    };
    const onAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('pwa_install_prompt_parent', 'installed');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (!visible) return null;

  const shouldInstallFirst =
    !isInstalled && localStorage.getItem('pwa_install_prompt_parent') !== 'installed';

  const install = async () => {
    setBusy(true);
    setError('');
    try {
      if (!installPrompt) {
        localStorage.setItem('pwa_install_prompt_parent', 'installed');
        setIsInstalled(true);
        return;
      }
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === 'accepted') {
        localStorage.setItem('pwa_install_prompt_parent', 'installed');
        setIsInstalled(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start installation.');
    } finally {
      setBusy(false);
    }
  };

  const enable = async () => {
    setBusy(true);
    setError('');
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('This browser does not support push notifications.');
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        localStorage.setItem('push_prompt_parent', 'dismissed');
        setVisible(false);
        return;
      }
      const publicKey = await fetchVapidPublicKey();
      if (!publicKey) throw new Error('Push notifications are not configured.');
      const registration = await navigator.serviceWorker.register('/push-handler.js');
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      await subscribePushNotifications(subscription);
      setVisible(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not enable notifications.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-[180] mx-auto max-w-md rounded-xl border border-outline-variant/30 bg-background p-5 shadow-xl">
      <div className="flex gap-3">
        <Bell className="mt-1 shrink-0 text-primary" size={18} />
        <div className="space-y-3">
          <div>
            <h2 className="font-serif text-lg text-primary">
              {shouldInstallFirst ? 'Install the app' : 'Enable notifications'}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {shouldInstallFirst
                ? 'Install this app first. Notifications work better and are less likely to be refused by the browser.'
                : 'Receive school updates and payment alerts directly in this app.'}
            </p>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex gap-2">
            {shouldInstallFirst ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void install()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white disabled:opacity-60"
              >
                <Download size={13} /> {busy ? 'Opening...' : installPrompt ? 'Install app' : 'I installed it'}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void enable()}
                className="rounded-lg bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white disabled:opacity-60"
              >
                {busy ? 'Enabling...' : 'Enable'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (shouldInstallFirst) {
                  localStorage.setItem('pwa_install_prompt_parent', 'installed');
                  setIsInstalled(true);
                } else {
                  localStorage.setItem('push_prompt_parent', 'dismissed');
                  setVisible(false);
                }
              }}
              className="rounded-lg border border-outline-variant/30 px-4 py-2 font-mono text-[10px] uppercase tracking-widest"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
