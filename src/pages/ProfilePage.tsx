import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { statusIcons } from '../i18n';

const emojis = ['✝', '⛪', '🙏', '📖', '🔥', '💧', '🕊', '🌟', '⚓', '🎯', '💡', '🌿', '☀️', '❤️', '🤝', '👨', '👨‍🦳', '🧔', '👳', '🙎'];

const denominations = [
  { value: 'orthodox', labelKey: 'profile.denominations.orthodox' },
  { value: 'catholic', labelKey: 'profile.denominations.catholic' },
  { value: 'baptist', labelKey: 'profile.denominations.baptist' },
  { value: 'pentecostal', labelKey: 'profile.denominations.pentecostal' },
  { value: 'charismatic', labelKey: 'profile.denominations.charismatic' },
  { value: 'other', labelKey: 'profile.denominations.other' },
];

const interests = [
  { value: 'prayer', labelKey: 'profile.interestsList.prayer' },
  { value: 'bibleStudy', labelKey: 'profile.interestsList.bibleStudy' },
  { value: 'homeGroup', labelKey: 'profile.interestsList.homeGroup' },
  { value: 'churchService', labelKey: 'profile.interestsList.churchService' },
  { value: 'fellowship', labelKey: 'profile.interestsList.fellowship' },
  { value: 'mentoring', labelKey: 'profile.interestsList.mentoring' },
];

const statuses = [
  { value: 'readyToPray', labelKey: 'profile.statusesList.readyToPray' },
  { value: 'readyToChat', labelKey: 'profile.statusesList.readyToChat' },
  { value: 'lookingHomeGroup', labelKey: 'profile.statusesList.lookingHomeGroup' },
  { value: 'lookingFriends', labelKey: 'profile.statusesList.lookingFriends' },
];

const languages = [
  { value: 'ru' as const, labelKey: 'profile.languages.ru' },
  { value: 'be' as const, labelKey: 'profile.languages.be' },
  { value: 'en' as const, labelKey: 'profile.languages.en' },
];

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, signOut, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [selectedEmoji, setSelectedEmoji] = useState(user?.display_icon || '✝');
  const [denomination, setDenomination] = useState(user?.denomination || 'orthodox');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(user?.statuses || []);
  const [language, setLanguage] = useState(user?.language || 'ru');

  const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleSave = () => {
    updateUser({ display_name: displayName, display_icon: selectedEmoji, denomination, interests: selectedInterests, statuses: selectedStatuses, language });
    i18n.changeLanguage(language);
  };

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-4 pt-8 pb-12 text-white">
        <div className="w-20 h-20 rounded-full bg-white/20 mx-auto flex items-center justify-center text-3xl">
          {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : (displayName?.[0]?.toUpperCase() || '?')}
        </div>
        <h2 className="text-center mt-3 font-semibold text-lg">{displayName || 'User'}</h2>
      </div>
      <div className="px-4 -mt-4 space-y-4">
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
          <button onClick={handleSave} className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium">{t('profile.save')}</button>
        </div>
        <button onClick={signOut} className="w-full bg-gray-100 text-red-600 rounded-xl p-4 text-sm font-medium hover:bg-gray-200">{t('profile.signOut')}</button>
      </div>
    </div>
  );
}
