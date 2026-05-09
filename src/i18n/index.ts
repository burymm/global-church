import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      nav: { map: 'Карта', chat: 'Чат', profile: 'Профиль', settings: 'Меню', userSettings: 'Пользователь', back: 'Назад' },
      auth: { signIn: 'Войти', google: 'Войти через Google', welcome: 'Добро пожаловать в Global Church', description: 'Найди христиан для молитвы, общения и домашней группы', terms: 'Продолжая, вы соглашаетесь с условиями использования' },
      callback: { authorizing: 'Авторизация...', profileError: 'Ошибка создания профиля', timeout: 'Время ожидания истекло' },
      map: { title: 'Карта', shareLocation: '📍 Поделиться местоположением', stopSharing: '🔴 Остановить передачу', readyTo: 'Готов', locationDenied: 'Геолокация заблокирована', locationDeniedHint: 'Разрешите в настройках браузера или Настройки телефона → Конфиденциальность', permissionPrompt: 'Разрешите доступ к местоположению для отображения на карте' },
      chat: { title: 'Сообщения', noConversations: 'Начните разговор, нажав на пользователя на карте', typeMessage: 'Напишите сообщение...', send: 'Отправить', chatLabel: 'Чат', noUser: 'Пользователь', loading: 'Загрузка...' },
      profile: {
        title: 'Профиль', displayName: 'Имя', denomination: 'Конфессия', interests: 'Интересы', statuses: 'Статусы', language: 'Язык', signOut: 'Выйти', save: 'Сохранить',
        languages: { ru: 'Русский', be: 'Беларуская', en: 'English' },
        denominations: { orthodox: 'Православный', catholic: 'Католик', baptist: 'Баптист', pentecostal: 'Пятидесятник', charismatic: 'Харизмат', other: 'Другой' },
        interestsList: { prayer: 'Помолиться', bibleStudy: 'Изучить Библию', homeGroup: 'Найти домашнюю группу', churchService: 'Посетить службу', fellowship: 'Общение', mentoring: 'Наставничество' },
        statusesList: { readyToPray: 'Готов помолиться', readyToChat: 'Готов пообщаться', lookingHomeGroup: 'Ищу домашнюю группу', lookingFriends: 'Ищу друзей-христиан', openToTalk: 'Открыт для разговора' },
      },
      common: { loading: 'Загрузка...' },
      settings: { icon: 'Иконка', openFor: 'Открыт для' },
    },
  },
  be: {
    translation: {
      nav: { map: 'Карта', chat: 'Чат', profile: 'Профіль' },
      auth: { signIn: 'Увайсці', google: 'Увайсці праз Google', welcome: 'Сардэчна запрашаем у Global Church', description: 'Знайдзі хрысціян для малітвы, супольнасці і хатняй групы', terms: 'Працягваючы, вы згаджаецеся з умовамі выкарыстання' },
      callback: { authorizing: 'Аўтарызацыя...', profileError: 'Памылка стварэння профілю', timeout: 'Чаканне скончылася' },
      map: { title: 'Карта', shareLocation: 'Падзяліцца месцазнаходжаннем', stopSharing: 'Спыніць перадачу', readyTo: 'Гатовы', locationDenied: 'Геалакацыя заблакіравана', locationDeniedHint: 'Дазвольце ў наладах браўзера або Налады тэлефона → Канфідэнцыяльнасць', permissionPrompt: 'Дазвольце доступ да месцазнаходжання для адлюстравання на карце' },
      chat: { title: 'Паведамленні', noConversations: 'Пачніце размову, націснуўшы на карыстальніка на карце', typeMessage: 'Напішыце паведамленне...', send: 'Адправіць', chatLabel: 'Чат', noUser: 'Карыстальнік', loading: 'Загрузка...' },
      profile: {
        title: 'Профіль', displayName: 'Імя', denomination: 'Канфесія', interests: 'Інтарэсы', statuses: 'Статусы', language: 'Мова', signOut: 'Выйсці', save: 'Захаваць',
        languages: { ru: 'Руская', be: 'Беларуская', en: 'English' },
        denominations: { orthodox: 'Праваслаўны', catholic: 'Католік', baptist: 'Баптыст', pentecostal: 'Пяцідзясятнік', charismatic: 'Харызмат', other: 'Іншы' },
        interestsList: { prayer: 'Памаліцца', bibleStudy: 'Вывучыць Біблію', homeGroup: 'Знайсці хатнюю групу', churchService: 'Наведаць службу', fellowship: 'Супольнасць', mentoring: 'Настаўніцтва' },
        statusesList: { readyToPray: 'Гатовы памаліцца', readyToChat: 'Гатовы пагутарыць', lookingHomeGroup: 'Шукаю хатнюю групу', lookingFriends: 'Шукаю сяброў-хрысціян', openToTalk: 'Адкрыты для размовы' },
      },
      common: { loading: 'Загрузка...' },
      settings: { icon: 'Іконка', openFor: 'Адкрыты для' },
    },
  },
  en: {
    translation: {
      nav: { map: 'Map', chat: 'Chat', profile: 'Profile' },
      auth: { signIn: 'Sign In', google: 'Sign in with Google', welcome: 'Welcome to Global Church', description: 'Find Christians for prayer, fellowship, and home groups', terms: 'By continuing, you agree to the terms of use' },
      callback: { authorizing: 'Authorizing...', profileError: 'Failed to create profile', timeout: 'Request timed out' },
      map: { title: 'Map', shareLocation: 'Share Location', stopSharing: 'Stop Sharing', readyTo: 'Ready to', locationDenied: 'Location access blocked', locationDeniedHint: 'Allow in browser settings or Phone Settings → Privacy', permissionPrompt: 'Allow location access to appear on the map' },
      chat: { title: 'Messages', noConversations: 'Start a conversation by tapping on a user on the map', typeMessage: 'Type a message...', send: 'Send', chatLabel: 'Chat', noUser: 'User', loading: 'Loading...' },
      profile: {
        title: 'Profile', displayName: 'Display Name', denomination: 'Denomination', interests: 'Interests', statuses: 'Statuses', language: 'Language', signOut: 'Sign Out', save: 'Save',
        languages: { ru: 'Russian', be: 'Belarusian', en: 'English' },
        denominations: { orthodox: 'Orthodox', catholic: 'Catholic', baptist: 'Baptist', pentecostal: 'Pentecostal', charismatic: 'Charismatic', other: 'Other' },
        interestsList: { prayer: 'Prayer', bibleStudy: 'Bible Study', homeGroup: 'Find a Home Group', churchService: 'Attend Church Service', fellowship: 'Fellowship', mentoring: 'Mentoring' },
        statusesList: { readyToPray: 'Ready to Pray', readyToChat: 'Ready to Chat', lookingHomeGroup: 'Looking for a Home Group', lookingFriends: 'Looking for Christian Friends', openToTalk: 'Open to Talk' },
      },
      common: { loading: 'Loading...' },
      settings: { icon: 'Icon', openFor: 'Open to' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ru',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
