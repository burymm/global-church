export const emojis = ['✝', '⛪', '🙏', '📖', '🔥', '💧', '🕊', '🌟', '⚓', '🎯', '💡', '🌿', '☀️', '❤️', '🤝', '👨', '👨‍🦳', '🧔', '👳', '🙎'];

export const denominations = [
  { value: 'orthodox', labelKey: 'profile.denominations.orthodox' },
  { value: 'catholic', labelKey: 'profile.denominations.catholic' },
  { value: 'baptist', labelKey: 'profile.denominations.baptist' },
  { value: 'pentecostal', labelKey: 'profile.denominations.pentecostal' },
  { value: 'charismatic', labelKey: 'profile.denominations.charismatic' },
  { value: 'other', labelKey: 'profile.denominations.other' },
];

export const interests = [
  { value: 'prayer', labelKey: 'profile.interestsList.prayer' },
  { value: 'bibleStudy', labelKey: 'profile.interestsList.bibleStudy' },
  { value: 'homeGroup', labelKey: 'profile.interestsList.homeGroup' },
  { value: 'churchService', labelKey: 'profile.interestsList.churchService' },
  { value: 'fellowship', labelKey: 'profile.interestsList.fellowship' },
  { value: 'mentoring', labelKey: 'profile.interestsList.mentoring' },
];

export const statuses = [
  { value: 'readyToPray', labelKey: 'profile.statusesList.readyToPray' },
  { value: 'readyToChat', labelKey: 'profile.statusesList.readyToChat' },
  { value: 'lookingHomeGroup', labelKey: 'profile.statusesList.lookingHomeGroup' },
  { value: 'lookingFriends', labelKey: 'profile.statusesList.lookingFriends' },
];

export const languages = [
  { value: 'ru' as const, labelKey: 'profile.languages.ru' },
  { value: 'be' as const, labelKey: 'profile.languages.be' },
  { value: 'en' as const, labelKey: 'profile.languages.en' },
];

export const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
  setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
};
