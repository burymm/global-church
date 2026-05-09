import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const tabs = [
  { path: '/map', icon: '🗺️', labelKey: 'nav.map' },
  { path: '/chat', icon: '💬', labelKey: 'nav.chat' },
  { path: '/profile', icon: '👤', labelKey: 'nav.profile' },
];

export function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <a key={tab.path} href={tab.path}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className="text-xl">{tab.icon}</span>
                <span className="text-xs mt-0.5">{t(tab.labelKey)}</span>
              </a>
            );
          })}
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <button onClick={() => setShowMenu(!showMenu)}
              className="flex flex-col items-center justify-center text-gray-500">
              <span className="text-xl">⚙</span>
              <span className="text-xs mt-0.5">{t('nav.settings')}</span>
            </button>
            {showMenu && (
              <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <button onClick={() => { setShowMenu(false); navigate('/settings'); }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100">
                  {t('nav.userSettings')}
                </button>
                <button onClick={() => { setShowMenu(false); signOut(); }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-50">
                  {t('profile.signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
