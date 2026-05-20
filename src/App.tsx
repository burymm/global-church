import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { unlockAudio } from './utils/notification';
import { MapPage } from './pages/MapPage';
import { ChatPage } from './pages/ChatPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { BottomNav } from './components/ui/BottomNav';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { ProfilePopup } from './components/ProfilePopup';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { session, isLoading, init } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  const { init: chatInit, destroy: chatDestroy } = useChatStore();

  useEffect(() => {
    if (session) {
      chatInit();
    } else {
      chatDestroy();
    }
  }, [session, chatInit, chatDestroy]);

  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-full">{t('common.loading')}</div>;

  return (
    <BrowserRouter>
      <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden pb-20">
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            {session ? (
              <>
                <Route path="/" element={<MapPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:userId" element={<ChatPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            )}

          </Routes>
        </div>
        {session && <BottomNav />}
        <PwaInstallPrompt />
        {session && <ProfilePopup />}
      </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
