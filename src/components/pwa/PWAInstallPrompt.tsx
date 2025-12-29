import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share, Smartphone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    // Detect iOS
    const isIOS = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    };

    // Detect Safari on iOS
    const isIOSSafari = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
        return isIos && isSafari;
    };

    // Check if app is installed (standalone mode)
    const checkIfInstalled = useCallback(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone);
        return isStandalone;
    }, []);

    useEffect(() => {
        // Check if already installed
        if (checkIfInstalled()) {
            return;
        }

        // Check if user has dismissed the prompt recently
        const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (lastDismissed) {
            const dismissedDate = new Date(lastDismissed);
            const now = new Date();
            const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return; // Don't show again for 7 days
            }
        }

        // Handle beforeinstallprompt event (Chrome, Edge, etc.)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 3 seconds
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Handle iOS - show custom prompt after delay
        if (isIOS() && !checkIfInstalled()) {
            setTimeout(() => {
                setShowIOSPrompt(true);
            }, 5000);
        }

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
            console.log('✅ PWA instalado com sucesso!');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [checkIfInstalled]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ Usuário aceitou instalar o PWA');
            } else {
                console.log('❌ Usuário recusou instalar o PWA');
                localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
            }

            setDeferredPrompt(null);
            setShowPrompt(false);
        } catch (error) {
            console.error('Erro ao instalar PWA:', error);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setShowIOSPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    };

    // Don't render if installed or no prompt available
    if (isInstalled) return null;

    // Android/Chrome prompt
    if (showPrompt && deferredPrompt) {
        return (
            <div className="fixed inset-x-0 bottom-0 z-[9999] p-4 safe-area-bottom animate-slide-up">
                <div className="max-w-md mx-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative p-4 pb-2">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-4 h-4 text-white/70" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                                <img src="/icons/icon-96x96.png" alt="Logo" className="w-10 h-10 rounded-lg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Member Zone Pro</h3>
                                <p className="text-sm text-white/50">Instale o app no seu dispositivo</p>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-3 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-primary" />
                                <span>Acesso rápido</span>
                            </div>
                            <span className="text-white/30">•</span>
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4 text-primary" />
                                <span>Funciona offline</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-2 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleDismiss}
                            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            Agora não
                        </Button>
                        <Button
                            onClick={handleInstall}
                            className="flex-1 bg-primary hover:bg-primary/90 gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Instalar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // iOS Safari prompt (manual instructions)
    if (showIOSPrompt) {
        return (
            <div className="fixed inset-x-0 bottom-0 z-[9999] p-4 safe-area-bottom animate-slide-up">
                <div className="max-w-md mx-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative p-4 pb-2">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-4 h-4 text-white/70" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                                <img src="/icons/icon-96x96.png" alt="Logo" className="w-10 h-10 rounded-lg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Instalar App</h3>
                                <p className="text-sm text-white/50">Adicione à tela inicial</p>
                            </div>
                        </div>
                    </div>

                    {/* iOS Instructions */}
                    <div className="px-4 py-3 space-y-3">
                        <p className="text-sm text-white/70">
                            Para instalar o app no seu iPhone:
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                    1
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <span>Toque em</span>
                                    <Share className="w-5 h-5 text-blue-400" />
                                    <span className="text-white/50">(compartilhar)</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                    2
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <span>Selecione</span>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded text-xs">
                                        <Plus className="w-3 h-3" />
                                        Tela de Início
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                    3
                                </div>
                                <span className="text-white/80">Toque em "Adicionar"</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-2">
                        <Button
                            onClick={handleDismiss}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            Entendi!
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// Hook para usar o PWA install em outros componentes
export const usePWAInstall = () => {
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            setCanInstall(false);
            return outcome === 'accepted';
        } catch (error) {
            console.error('Erro ao instalar:', error);
            return false;
        }
    };

    return { canInstall, isInstalled, install };
};
