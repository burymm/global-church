import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

const tabs = [
  { path: '/map', icon: '🗺️', labelKey: 'nav.map' },
  { path: '/chat', icon: '💬', labelKey: 'nav.chat' },
  { path: '/profile', icon: '👤', labelKey: 'nav.profile' },
]

export function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <a key={tab.path} href={tab.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-0.5">{t(tab.labelKey)}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
