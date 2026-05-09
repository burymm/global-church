import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { MapPage } from './pages/MapPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { BottomNav } from './components/ui/BottomNav';

export default function App() {
  const { session, isLoading, init } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  if (isLoading) return <div className="flex items-center justify-center h-full">{t('common.loading')}</div>;

  return (
    <BrowserRouter>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            {session ? (
              <>
                <Route path="/" element={<MapPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
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
      </div>
    </BrowserRouter>
  );
}
