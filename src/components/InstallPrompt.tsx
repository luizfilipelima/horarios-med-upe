import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Share2, Download, Smartphone } from 'lucide-react';

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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="fixed left-4 right-4 bottom-[max(env(safe-area-inset-bottom,20px),20px)] z-40 pointer-events-none"
        >
          <div
            className="pointer-events-auto max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10"
            role="banner"
          >
            <div className="relative flex gap-4 px-4 py-4 pr-12">
              {/* Ícone à esquerda */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <Smartphone size={20} strokeWidth={2} />
              </div>

              {/* Conteúdo à direita */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                  Instale o App Gradly
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                  Acesso rápido, direto na sua tela inicial.
                </p>

                {isIOS() ? (
                  <div className="mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                    <Share2 size={14} strokeWidth={2} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
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
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                    Use o menu do navegador (⋮) e selecione &quot;Adicionar à tela inicial&quot;.
                  </p>
                )}
              </div>

              {/* Botão fechar */}
              <button
                type="button"
                onClick={hide}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                aria-label="Fechar"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
