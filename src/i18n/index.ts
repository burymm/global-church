import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      nav: { map: 'Карта', chat: 'Чат', profile: 'Профиль', settings: 'Меню', userSettings: 'Пользователь', back: 'Закрыть' },
      auth: { signIn: 'Войти', google: 'Войти через Google', welcome: 'Добро пожаловать в Global Church', description: 'Найди христиан для молитвы, общения и домашней группы', terms: 'Продолжая, вы соглашаетесь с условиями использования' },
      callback: { authorizing: 'Авторизация...', profileError: 'Ошибка создания профиля', timeout: 'Время ожидания истекло' },
      map: { title: 'Карта', shareLocation: '📍 Поделиться местоположением', stopSharing: '🔴 Остановить передачу', centerOnMe: 'Центрировать на мне', readyTo: 'Готов', locationDenied: 'Геолокация заблокирована', locationDeniedHint: 'Разрешите в настройках браузера или Настройки телефона → Конфиденциальность', permissionPrompt: 'Разрешите доступ к местоположению для отображения на карте' },
      chat: { title: 'Сообщения', noConversations: 'Начните разговор, нажав на пользователя на карте', typeMessage: 'Напишите сообщение...', send: 'Отправить', chatLabel: 'Чат', noUser: 'Пользователь', loading: 'Загрузка...', deleteChat: 'Удалить чат', deleteConfirm: 'Вы уверены? Все сообщения в этом чате будут удалены безвозвратно.', userNotFound: 'Пользователь не найден', chatUnavailable: 'Чат недоступен. Начните разговор с карты.' },
      profile: {
        title: 'Профиль', displayName: 'Имя', icon: 'Иконка', denomination: 'Конфессия', interests: 'Интересы', statuses: 'Статусы', language: 'Язык', signOut: 'Выйти', save: 'Сохранить',
        languages: { ru: 'Русский', be: 'Беларуская', en: 'English' },
        denominations: { orthodox: 'Православный', catholic: 'Католик', baptist: 'Баптист', pentecostal: 'Пятидесятник', charismatic: 'Харизмат', other: 'Другой' },
        interestsList: { prayer: 'Помолиться', bibleStudy: 'Изучить Библию', homeGroup: 'Найти домашнюю группу', churchService: 'Посетить службу', fellowship: 'Общение', mentoring: 'Наставничество' },
        statusesList: { readyToPray: 'Готов помолиться', readyToChat: 'Готов пообщаться', lookingHomeGroup: 'Ищу домашнюю группу', lookingFriends: 'Ищу друзей-христиан' },
      },
      common: { loading: 'Загрузка...' },
      pwa: { installTitle: 'Установить приложение', installDesc: 'Работает быстрее и без интернета', install: 'Установить', gotIt: 'Понятно', iosStep1: 'Нажмите «Поделиться» внизу экрана', iosStep2: 'Листайте вниз и нажмите «На экран «Домой»»', iosStep3: 'Нажмите «Добавить» в правом верхнем углу', androidStep1: 'Откройте меню браузера (⋮)', androidStep2: 'Нажмите «Добавить на главный экран»', androidStep3: 'Нажмите «Добавить»' },
    },
  },
  be: {
    translation: {
      nav: { map: 'Карта', chat: 'Чат', profile: 'Профіль', settings: 'Меню', userSettings: 'Карыстальнік', back: 'Закрыць' },
      auth: { signIn: 'Увайсці', google: 'Увайсці праз Google', welcome: 'Сардэчна запрашаем у Global Church', description: 'Знайдзі хрысціян для малітвы, супольнасці і хатняй групы', terms: 'Працягваючы, вы згаджаецеся з умовамі выкарыстання' },
      callback: { authorizing: 'Аўтарызацыя...', profileError: 'Памылка стварэння профілю', timeout: 'Чаканне скончылася' },
      map: { title: 'Карта', shareLocation: 'Падзяліцца месцазнаходжаннем', stopSharing: 'Спыніць перадачу', centerOnMe: 'Цэнтраваць на мне', readyTo: 'Гатовы', locationDenied: 'Геалакацыя заблакіравана', locationDeniedHint: 'Дазвольце ў наладах браўзера або Налады тэлефона → Канфідэнцыяльнасць', permissionPrompt: 'Дазвольце доступ да месцазнаходжання для адлюстравання на карце' },
      chat: { title: 'Паведамленні', noConversations: 'Пачніце размову, націснуўшы на карыстальніка на карце', typeMessage: 'Напішыце паведамленне...', send: 'Адправіць', chatLabel: 'Чат', noUser: 'Карыстальнік', loading: 'Загрузка...', deleteChat: 'Выдаліць чат', deleteConfirm: 'Вы ўпэўнены? Усе паведамленні ў гэтым чаце будуць выдалены беззваротна.', userNotFound: 'Карыстальнік не знойдзены', chatUnavailable: 'Чат недаступны. Пачніце размову з карты.' },
      profile: {
        title: 'Профіль', displayName: 'Імя', icon: 'Іконка', denomination: 'Канфесія', interests: 'Інтарэсы', statuses: 'Статусы', language: 'Мова', signOut: 'Выйсці', save: 'Захаваць',
        languages: { ru: 'Руская', be: 'Беларуская', en: 'English' },
        denominations: { orthodox: 'Праваслаўны', catholic: 'Католік', baptist: 'Баптыст', pentecostal: 'Пяцідзясятнік', charismatic: 'Харызмат', other: 'Іншы' },
        interestsList: { prayer: 'Памаліцца', bibleStudy: 'Вывучыць Біблію', homeGroup: 'Знайсці хатнюю групу', churchService: 'Наведаць службу', fellowship: 'Супольнасць', mentoring: 'Настаўніцтва' },
        statusesList: { readyToPray: 'Гатовы памаліцца', readyToChat: 'Гатовы пагутарыць', lookingHomeGroup: 'Шукаю хатнюю групу', lookingFriends: 'Шукаю сяброў-хрысціян' },
      },
      common: { loading: 'Загрузка...' },
      pwa: { installTitle: 'Усталяваць праграму', installDesc: 'Працуе хутчэй і без інтэрнэту', install: 'Усталяваць', gotIt: 'Зразумела', iosStep1: 'Націсніце «Падзяліцца» ўнізе экрана', iosStep2: 'Гартайце ўніз і націсніце «На экран «Дом»»', iosStep3: 'Націсніце «Дадаць» уверсе справа', androidStep1: 'Адкрыйце меню браўзера (⋮)', androidStep2: 'Націсніце «Дадаць на галоўны экран»', androidStep3: 'Націсніце «Дадаць»' },
    },
  },
  en: {
    translation: {
      nav: { map: 'Map', chat: 'Chat', profile: 'Profile', settings: 'Menu', userSettings: 'User', back: 'Close' },
      auth: { signIn: 'Sign In', google: 'Sign in with Google', welcome: 'Welcome to Global Church', description: 'Find Christians for prayer, fellowship, and home groups', terms: 'By continuing, you agree to the terms of use' },
      callback: { authorizing: 'Authorizing...', profileError: 'Failed to create profile', timeout: 'Request timed out' },
      map: { title: 'Map', shareLocation: 'Share Location', stopSharing: 'Stop Sharing', centerOnMe: 'Center on me', readyTo: 'Ready to', locationDenied: 'Location access blocked', locationDeniedHint: 'Allow in browser settings or Phone Settings → Privacy', permissionPrompt: 'Allow location access to appear on the map' },
      chat: { title: 'Messages', noConversations: 'Start a conversation by tapping on a user on the map', typeMessage: 'Type a message...', send: 'Send', chatLabel: 'Chat', noUser: 'User', loading: 'Loading...', deleteChat: 'Delete chat', deleteConfirm: 'Are you sure? All messages in this chat will be permanently deleted.', userNotFound: 'User not found', chatUnavailable: 'Chat unavailable. Start a conversation from the map.' },
      profile: {
        title: 'Profile', displayName: 'Display Name', icon: 'Icon', denomination: 'Denomination', interests: 'Interests', statuses: 'Statuses', language: 'Language', signOut: 'Sign Out', save: 'Save',
        languages: { ru: 'Russian', be: 'Belarusian', en: 'English' },
        denominations: { orthodox: 'Orthodox', catholic: 'Catholic', baptist: 'Baptist', pentecostal: 'Pentecostal', charismatic: 'Charismatic', other: 'Other' },
        interestsList: { prayer: 'Prayer', bibleStudy: 'Bible Study', homeGroup: 'Find a Home Group', churchService: 'Attend Church Service', fellowship: 'Fellowship', mentoring: 'Mentoring' },
        statusesList: { readyToPray: 'Ready to Pray', readyToChat: 'Ready to Chat', lookingHomeGroup: 'Looking for a Home Group', lookingFriends: 'Looking for Christian Friends' },
      },
      common: { loading: 'Loading...' },
      pwa: { installTitle: 'Install App', installDesc: 'Works faster and offline', install: 'Install', gotIt: 'Got it', iosStep1: 'Tap the Share button at the bottom', iosStep2: 'Scroll down and tap "Add to Home Screen"', iosStep3: 'Tap "Add" in the top right corner', androidStep1: 'Open the browser menu (⋮)', androidStep2: 'Tap "Add to Home Screen"', androidStep3: 'Tap "Add"' },
    },
  },
};

export const statusIcons: Record<string, string> = {
  readyToPray: '🙏',
  readyToChat: '💬',
  lookingHomeGroup: '🏠',
  lookingFriends: '👫',
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ru',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
