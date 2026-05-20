import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { statusIcons } from '../i18n';
import { emojis, denominations, interests, statuses, languages, toggle } from '../lib/profileConstants';

export function ProfilePopup() {
  const { t, i18n } = useTranslation();
  const { user, signOut, updateUser } = useAuthStore();
  const { isOpen, close } = useProfileStore();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [selectedEmoji, setSelectedEmoji] = useState(user?.display_icon || '✝');
  const [denomination, setDenomination] = useState(user?.denomination || 'orthodox');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(user?.statuses || []);
  const [language, setLanguage] = useState(user?.language || 'ru');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.settings?.notifications_enabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(user?.settings?.sound_enabled ?? true);

  const handleSave = async () => {
    await updateUser({ display_name: displayName, display_icon: selectedEmoji, denomination, interests: selectedInterests, statuses: selectedStatuses, language, settings: { notifications_enabled: notificationsEnabled, sound_enabled: soundEnabled } });
    i18n.changeLanguage(language);
    close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] bg-black/50 flex items-center justify-center">
        <div className="bg-white w-full sm:max-w-lg h-dvh sm:h-auto sm:max-h-[90vh] sm:rounded-2xl flex flex-col">
        <div className="shrink-0 bg-gradient-to-b from-blue-600 to-blue-700 px-4 pt-3 pb-8 text-white sm:rounded-t-2xl">
          <div className="flex justify-end mb-1">
            <button onClick={close} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">&times;</button>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1" />
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full bg-white/20 mx-auto flex items-center justify-center text-2xl">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : (displayName?.[0]?.toUpperCase() || '?')}
              </div>
              <h2 className="mt-2 font-semibold text-base">{displayName || 'User'}</h2>
            </div>
            <div className="flex-1" />
          </div>
        </div>
        <div className="px-4 space-y-4 pb-6 mt-2 overflow-y-auto flex-1">
          <div className="bg-white rounded-xl shadow p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.icon')}</label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji) => (
                  <button key={emoji} onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center ${selectedEmoji === emoji ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.displayName')}</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.language')}</label>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button key={lang.value} onClick={() => setLanguage(lang.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${language === lang.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t(lang.labelKey)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.denomination')}</label>
              <div className="flex flex-wrap gap-2">
                {denominations.map((d) => (
                  <button key={d.value} onClick={() => setDenomination(d.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${denomination === d.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t(d.labelKey)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.interests')}</label>
              <div className="flex flex-wrap gap-2">
                {interests.map((item) => (
                  <button key={item.value} onClick={() => toggle(selectedInterests, item.value, setSelectedInterests)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${selectedInterests.includes(item.value) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t(item.labelKey)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.statuses')}</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((item) => (
                  <button key={item.value} onClick={() => toggle(selectedStatuses, item.value, setSelectedStatuses)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${selectedStatuses.includes(item.value) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{statusIcons[item.value]} {t(item.labelKey)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.notifications')}</label>
              <div className="flex gap-4">
                <button onClick={() => setNotificationsEnabled(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${notificationsEnabled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {t('common.on')}
                </button>
                <button onClick={() => setNotificationsEnabled(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${!notificationsEnabled ? 'bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t('common.off')}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.sound')}</label>
              <div className="flex gap-4">
                <button onClick={() => setSoundEnabled(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${soundEnabled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {t('common.on')}
                </button>
                <button onClick={() => setSoundEnabled(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${!soundEnabled ? 'bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t('common.off')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 px-4 pb-6">
          <div className="flex gap-2 items-center">
            <button onClick={handleSave}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium">
              {t('profile.save')}
            </button>
            <button onClick={signOut}
              className="w-10 h-10 bg-gray-100 text-red-500 rounded-lg flex items-center justify-center text-sm"
              title={t('profile.signOut')}>🚪</button>
          </div>
        </div>
      </div>
    </div>
  );
}
