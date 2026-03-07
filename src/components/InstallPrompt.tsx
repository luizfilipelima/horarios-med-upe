import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Share2, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'gradly-install-prompt-dismissed';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod|mobile/i.test(ua);
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  const hide = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isMobile() || isStandalone()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') return;
    } catch {
      // ignore
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') hide();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none"
        >
          <div
            className="pointer-events-auto max-w-md mx-auto rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
            role="banner"
          >
            <div className="relative px-4 py-3 pr-12">
              <button
                type="button"
                onClick={hide}
                className="absolute top-3 right-3 p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                aria-label="Fechar"
              >
                <X size={18} strokeWidth={2} />
              </button>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 pr-8">
                📱 Tenha a Gradly sempre à mão! Adicione este painel à sua tela inicial.
              </p>
              {isIOS() ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                  <Share2 size={16} strokeWidth={2} className="shrink-0 text-indigo-500" />
                  <span>
                    Toque em <strong>Compartilhar</strong> e depois em &quot;Adicionar à Tela de Início&quot;.
                  </span>
                </div>
              ) : deferredPrompt ? (
                <motion.button
                  type="button"
                  onClick={handleInstall}
                  disabled={installing}
                  whileTap={{ scale: 0.98 }}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-70 transition-colors"
                >
                  <Download size={18} strokeWidth={2} />
                  {installing ? 'Instalando…' : 'Instalar App'}
                </motion.button>
              ) : (
                <p className="mt-2 text-xs text-gray-500 dark:text-zinc-500">
                  Use o menu do navegador (⋮) e selecione &quot;Adicionar à tela inicial&quot;.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
