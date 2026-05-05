# Технологический стек

## Обзор

| Категория | Технология | Бесплатно |
|-----------|-----------|-----------|
| Фронтенд | React 19 + TypeScript + Vite | ✅ |
| PWA | vite-plugin-pwa + manifest | ✅ |
| Стили | Tailwind CSS | ✅ |
| Авторизация | Supabase Auth (Google OAuth) | ✅ Free tier |
| База данных | PostgreSQL (Supabase Cloud) | ✅ 500MB |
| Realtime | Supabase Realtime (Postgres CDC) | ✅ |
| Карты | Leaflet + OpenStreetMap | ✅ |
| State management | Zustand | ✅ |
| i18n | i18next + react-i18next | ✅ |
| Хостинг | Vercel | ✅ Free tier |
| Локальная разработка | `npm run dev` | ✅ |

## Детали по каждому компоненту

### Фронтенд: React 19 + TypeScript + Vite

- **React 19** — текущая стабильная версия, Server Components не нужны (SPA)
- **TypeScript** — строгая типизация, все AI-агенты пишут типизированный код
- **Vite 6** — быстрый HMR, минимальная конфигурация, встроенный TypeScript

### PWA: vite-plugin-pwa

Генерирует manifest.json и service worker.
- `registerType: 'autoUpdate'` — автоматическое обновление
- Иконки: 192x192, 512x512
- `display: 'standalone'` — выглядит как нативное приложение
- `orientation: 'portrait'` — портретная ориентация

### Стили: Tailwind CSS

Utility-first CSS. Mobile-first подход.
- Кастомные темы через `tailwind.config.js`
- Safe area insets для notch-устройств
- Атомарные стили в JSX (никаких CSS-файлов кроме базового)

### Авторизация: Supabase Auth

Google OAuth 2.0 через `signInWithOAuth({ provider: 'google' })`.
- Бесплатно до 50,000 MAU
- Автоматическое управление сессиями
- Без хранения паролей
- Profile создается триггером в БД

### База данных: Supabase Cloud PostgreSQL

Free tier: 500MB база, 1GB RAM, unlimited requests.
- PostGIS (опционально для гео-запросов)
- Row Level Security (RLS) — каждый видит только свои данные
- Триггеры для создания профиля при регистрации
- Индексы для map-запросов

### Realtime: Supabase Realtime

Postgres Change Data Feed через WebSocket.
- Подписка на `INSERT` в таблице `messages`
- Подписка на `INSERT` в таблице `user_locations`
- Не нужен отдельный Socket.io сервер

### Карты: Leaflet + OpenStreetMap

- **Leaflet** — лёгкая карта (40KB)
- **OpenStreetMap** — бесплатные тайлы, без API key
- Без геокодинга на старте (координаты GPS)
- Кастомные маркеры (divIcon)

### State management: Zustand

Минималистичный store (в отличие от Redux).
- Файлы в `src/store/`
- Никаких провайдеров, хуки напрямую
- Интеграция с Supabase подписками

### i18n: i18next

- 3 языка: русский (default), белорусский, английский
- Автоопределение языка по браузеру (на будущее)
- Переводы в `src/i18n/index.ts`

### Хостинг: Vercel

- Бесплатный preview deploy для каждого коммита
- Автоматический preview URL для тестирования
- SPA routing через rewrites
- Edge caching для статики

## Что не нужно (и почему)

| Технология | Почему не нужно |
|-----------|----------------|
| Node.js бэкенд | Supabase покрывает всё: Auth + DB + Realtime |
| Socket.io | Supabase Realtime уже есть |
| Google Maps API | Платно, OpenStreetMap бесплатен |
| Redis / KV | Не нужен для v1 (малый трафик) |
| Firebase | Supabase бесплатнее и с PostgreSQL |
| App Store / Google Play | PWA, без публикации |
| Docker / self-hosted | Supabase Cloud free tier достаточно |
| Redis / RabbitMQ | Supabase Realtime заменяет |

## Масштабируемость (на будущее)

- При росте пользователей → платный Supabase Pro ($25/мес)
- При росте трафика → Cloudflare CDN перед Vercel
- При необходимости → переезд на self-hosted Supabase (Docker)
- Push-уведомления → Web Push (бесплатно) или Firebase Cloud Messaging

## Абстрактные слои (для миграции)

Все внешние API скрыты за интерфейсами, чтобы при необходимости заменить:

| Откуда | Куда | Что поменять |
|--------|------|-------------|
| Supabase → Node.js API | Один провайдер в `src/lib/services.ts` |
| OpenStreetMap/Leaflet → Google Maps API | Один провайдер в `src/lib/services.ts` |
| Supabase Auth → Auth0/Clerk | Один провайдер в `src/lib/services.ts` |

Подробности в [05-architecture-decisions.md](05-architecture-decisions.md).
