# Архитектура и структура проекта

## Структура файлов

```
global-church/
├── index.html                    # Entry HTML
├── vite.config.ts                # Vite + PWA конфигурация
├── tailwind.config.js            # Tailwind настройки
├── tsconfig.json                 # TypeScript конфигурация
├── postcss.config.js             # PostCSS (Tailwind)
├── .env.example                  # Список переменных окружения
├── .gitignore
├── public/
│   └── favicon.svg               # Иконка
├── backlog/
│   └── docs/                     # Документация проекта
│       ├── 01-project-overview.md
│       ├── 02-technology-stack.md
│       ├── 03-architecture.md    # Этот файл
│       ├── 04-roadmap.md
│       └── 05-architecture-decisions.md  # Абстрактные слои для миграции
├── supabase/
│   └── schema.sql                # SQL схема БД
└── src/
    ├── main.tsx                  # Entry point
    ├── App.tsx                   # Роутинг + авторизационный guard
    ├── index.css                 # Базовые стили (Tailwind + Leaflet)
    ├── vite-env.d.ts             # Типы для Vite env variables
    │
    ├── lib/
    │   └── supabase.ts           # Supabase клиент (инициализация)
    │
    ├── types/
    │   ├── index.ts              # User, Message, UserLocation
    │   └── supabase.ts           # Database types для Supabase
    │
    ├── store/
    │   ├── authStore.ts          # Auth сессия, user state
    │   ├── chatStore.ts          # Сообщения, conversations, Realtime
    │   └── locationStore.ts      # Геолокация, sharing state
    │
    ├── pages/
    │   ├── MapPage.tsx           # Полноэкранная карта + маркеры
    │   ├── ChatPage.tsx          # Список диалогов + чат
    │   ├── ProfilePage.tsx       # Редактирование профиля
    │   ├── AuthPage.tsx          # Google Sign In
    │   └── AuthCallbackPage.tsx  # OAuth redirect handler
    │
    ├── components/
    │   └── ui/
    │       ├── BottomNav.tsx     # Нижняя навигация (3 вкладки)
    │       └── MapMarkers.tsx    # Кастомные маркеры карты
    │
    ├── i18n/
    │   └── index.ts              # Переводы RU/BE/EN
    │
    └── services/                 # Интерфейсы (контракты)
        ├── authService.ts        # AuthService interface
        ├── dataService.ts        # DataService interface
        ├── realtimeService.ts    # RealtimeService interface
        ├── mapService.ts         # MapService interface
        └── locationService.ts    # LocationService interface (Geolocation API)
    │
    └── providers/                # Реализации интерфейсов
        ├── supabase/
        │   ├── auth.ts           # SupabaseAuthProvider
        │   ├── data.ts           # SupabaseDataProvider
        │   └── realtime.ts       # SupabaseRealtimeService
        ├── leaflet/
        │   └── map.ts            # LeafletMapProvider
        └── browser/
            └── geolocation.ts    # BrowserGeolocationProvider
```

## Роутинг

```
/auth               → Авторизация (Google Sign In)
/auth/callback      → OAuth redirect handler
/                   → Карта (по умолчанию)
/map                → Карта
/chat               → Список диалогов
/chat/:userId       → Чат с пользователем
/profile            → Профиль и настройки
*                   → редирект на / или /auth
```

## Поток данных

### Авторизация

```
Нажми "Sign in with Google"
  → Supabase OAuth popup
    → Google авторизует
      → Supabase создаёт сессию
        → Триггер создаёт профиль в users
          → App.tsx загружает user из store
            → Редирект на /
```

### Геолокация

```
Пользователь нажимает "Share Location"
  → navigator.geolocation.watchPosition()
    → Каждые 10-30 сек:
      → Supabase.users.update(lat, lng)
        → Другие пользователи видят на карте (polling каждые 30 сек)
```

### Сообщение

```
Нажми на маркер → открывается чат
  → chatStore.fetchMessages(userId)
    → Загрузка последних 100 сообщений
  → chatStore.subscribe(userId)
    → Supabase Realtime подписка на INSERT
  → Пользователь пишет → chatStore.sendMessage()
    → Supabase.messages.insert()
    → Получатель получает через Realtime (если онлайн)
      → Или при следующем открытии чата (если оффлайн)
```

## Ключевые решения

### 1. Один монолит, а не два проекта

Фронт и "бэк" (Supabase) в одном репозитории. Supabase — это и есть бэкенд.

### 2. Supabase вместо Node.js API

Большая часть логики в БД (RLS, триггеры). Не нужен отдельный сервер.

### 3. PWA вместо App Store

Быстрый старт без модерации Apple/Google. "Add to Home Screen" даёт нативный опыт.

### 4. Periodic polling вместо постоянного стрима

Геолокация обновляется каждые 10-30 сек (не каждый метр движения). Экономия ресурсов.

### 5. Zustand вместо Redux

Минимальный boilerplate, AI-агенты легко пишут stores.

### 6. Оптимизмичный UI

Отправка сообщения → мгновенное обновление в store → фоновая отправка в Supabase.

### 7. Абстрактные слои для миграции

Все внешние API скрыты за интерфейсами. Store вызывают методы через интерфейсы, не зная откуда приходят данные. Это позволяет заменить Supabase → Node.js API, OpenStreetMap → Google Maps, меняя одну строку в `src/lib/services.ts`.

Подробности в [05-architecture-decisions.md](05-architecture-decisions.md).
