import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useInstallStore } from '../../store/installStore';
import { useProfileStore } from '../../store/profileStore';
import { isStandalone } from '../../lib/isStandalone';

const tabs = [
  { path: '/map', icon: '🗺️', labelKey: 'nav.map' },
  { path: '/chat', icon: '💬', labelKey: 'nav.chat' },
];

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const { triggerInstall } = useInstallStore();
  const { open: openProfile } = useProfileStore();
  const totalUnread = useChatStore((state) => state.conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0));
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 z-[999] right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <a key={tab.path} href={tab.path}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className="text-xl">
                  {tab.icon}
                  {tab.path === '/chat' && totalUnread > 0 && (
                    <span className="absolute top-1 right-1/2 -mr-5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </span>
                <span className="text-xs mt-0.5">{t(tab.labelKey)}</span>
              </a>
            );
          })}
          <button onClick={openProfile}
            className="flex flex-col items-center justify-center w-full h-full text-gray-500">
            <span className="text-xl">👤</span>
            <span className="text-xs mt-0.5">{t('nav.profile')}</span>
          </button>
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <button onClick={() => setShowMenu(!showMenu)}
              className="flex flex-col items-center justify-center text-gray-500">
              <span className="text-xl">⚙</span>
              <span className="text-xs mt-0.5">{t('nav.settings')}</span>
            </button>
            {showMenu && (
              <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <button onClick={() => { setShowMenu(false); openProfile(); }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100">
                  {t('nav.userSettings')}
                </button>
                {!isStandalone && (
                  <button onClick={() => { setShowMenu(false); triggerInstall(); }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100">
                    📲 {t('pwa.install')}
                  </button>
                )}
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
