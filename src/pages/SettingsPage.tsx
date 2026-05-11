import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const statuses = [
  { value: 'readyToPray', labelKey: 'profile.statusesList.readyToPray' },
  { value: 'readyToChat', labelKey: 'profile.statusesList.readyToChat' },
  { value: 'lookingHomeGroup', labelKey: 'profile.statusesList.lookingHomeGroup' },
  { value: 'lookingFriends', labelKey: 'profile.statusesList.lookingFriends' },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [selectedEmoji, setSelectedEmoji] = useState(user?.display_icon || '✝');
  const [denomination, setDenomination] = useState(user?.denomination || 'orthodox');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(user?.statuses || []);

  const toggle = (list: string[], value: string) =>
    setSelectedStatuses(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleSave = () => {
    updateUser({ display_icon: selectedEmoji, denomination, statuses: selectedStatuses });
    navigate(-1);
  };

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-4 pt-8 pb-12 text-white">
        <button onClick={() => navigate(-1)} className="text-white text-sm mb-4">← {t('nav.back')}</button>
        <h2 className="text-center text-xl font-bold">{t('nav.userSettings')}</h2>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-xl shadow p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.icon')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.denomination')}</label>
            <div className="flex flex-wrap gap-2">
              {denominations.map((d) => (
                <button key={d.value} onClick={() => setDenomination(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${denomination === d.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {t(d.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.openFor')}</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((item) => (
                <button key={item.value} onClick={() => toggle(selectedStatuses, item.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${selectedStatuses.includes(item.value) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {statusIcons[item.value]} {t(item.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium">
            {t('profile.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
