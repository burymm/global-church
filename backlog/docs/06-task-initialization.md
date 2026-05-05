# Задача: Инициализация проекта Global Church

## Описание

Настроить рабочее окружение и запустить приложение локально. Включает создание Supabase проекта, настройку БД, Google OAuth и локальный запуск.

## Чек-лист

### 1. Supabase проект

- [X] Создать аккаунт на [supabase.com](https://supabase.com) (бесплатный план)
- [X] Создать новый проект
- [ ] Скопировать Project URL и anon key
- [ ] Записать в `.env`:
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=xxx
  ```

### 2. База данных

- [ ] Открыть SQL Editor в Supabase Dashboard
- [ ] Выполнить SQL из `supabase/schema.sql`:
  - Таблица `users` (профили)
  - Таблица `user_locations` (история геолокации)
  - Таблица `messages` (личные сообщения)
  - Индексы для map-запросов
  - Row Level Security правила
  - Триггер авто-создания профиля при регистрации
  - Supabase Realtime публикация
- [ ] Проверить в Table Editor что таблицы созданы: `users`, `user_locations`, `messages`

### 3. Google OAuth

- [ ] Supabase Dashboard → Authentication → Providers → Google
- [ ] Включить Google Provider
- [ ] Создать Google Cloud Console проект ([console.cloud.google.com](https://console.cloud.google.com))
- [ ] Настроить OAuth consent screen (тип: External)
- [ ] Создать OAuth 2.0 Client ID (Web application)
- [ ] Добавить Authorized redirect URIs:
  ```
  https://<PROJECT_REF>.supabase.co/auth/v1/authorize/google/callback
  http://localhost:5173/auth/callback
  ```
- [ ] Вставить Client ID и Client Secret в Supabase
- [ ] В Supabase Settings → URL Configuration → добавить Site URL и Redirect URLs:
  ```
  Site URL: http://localhost:5173
  Redirect URLs: http://localhost:5173/auth/callback
  ```

### 4. Dev Tools для AI-агентов (MCP)

- [ ] Установить chrome-devtools-mcp:
  ```
  claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
  ```
- [ ] Установить playwright-mcp:
  ```
  claude mcp add playwright --scope user npx @anthropic/playwright-mcp@latest
  ```
- [ ] Установить context7:
  ```
  claude mcp add context7 --scope user npx @anthropic/context7@latest
  ```
- [ ] Проверить: `claude mcp list` — все три MCP-сервера должны быть в списке

### 5. Локальный запуск

- [ ] Убедиться что Node.js 20+ установлен
- [ ] `npm install`
- [ ] Создать `.env` из `.env.example`
- [ ] `npm run dev`
- [ ] Открыть http://localhost:5173
- [ ] Проверить что отображается страница авторизации

### 6. Проверка авторизации

- [ ] Нажать "Sign in with Google"
- [ ] Авторизоваться через Google аккаунт
- [ ] Проверить что редирект на карту
- [ ] Проверить что профиль создан в Table Editor → `users`

### 7. Проверка функциональности

- [ ] Открыть приложение в другом браузере / инкогнито (второй аккаунт)
- [ ] Нажать "Share Location"
- [ ] Проверить что маркер появился на карте
- [ ] Нажать на маркер → открывается чат
- [ ] Отправить сообщение
- [ ] Проверить что сообщение доставлено второму аккаунту

## Ожидаемый результат

- Приложение доступно на http://localhost:5173
- Авторизация через Google работает
- Профиль автоматически создаётся в БД
- Геолокация передаётся и отображается на карте
- Личные сообщения отправляются и доставляются
- MCP-серверы установлены и работают (`claude mcp list`)
- AI-агент может открывать браузер и видеть результат своего кода

## Возможные проблемы

| Проблема | Решение |
|----------|---------|
| "Invalid redirect URI" | Проверить Redirect URLs в Supabase Settings и в Google Cloud Console |
| "Missing Supabase environment variables" | Убедиться что `.env` создан и содержит правильные значения |
| Google не появляется в списке провайдеров | Включить Google в Supabase Dashboard → Auth → Providers |
| Таблицы не созданы | Выполнить `supabase/schema.sql` в SQL Editor |
| Страница белая | Открыть DevTools Console, проверить ошибки |
| Маркер не появляется | Проверить что `is_sharing_location = true` в users таблице |
| MCP не установлен | Убедиться что `claude mcp` команда доступна и `claude mcp list` возвращает серверы |

## Файлы для задачи

| Файл | Назначение |
|------|-----------|
| `supabase/schema.sql` | SQL схема БД |
| `.env.example` | Шаблон переменных окружения |
| `.gitignore` | Исключает node_modules, .env, dist из git |
| `package.json` | Зависимости и скрипты |
| `package-lock.json` | Фиксация версий зависимостей |
| `vite.config.ts` | Vite + PWA конфигурация |
| `tsconfig.json` | TypeScript конфигурация |
| `tsconfig.node.json` | TypeScript для vite.config.ts |
| `tailwind.config.js` | Tailwind CSS настройки |
| `postcss.config.js` | PostCSS (Tailwind) |
| `index.html` | Entry HTML с Leaflet CSS |
| `public/favicon.svg` | Иконка приложения |
| `src/main.tsx` | Entry point |
| `src/App.tsx` | Роутинг + Auth guard |
| `src/index.css` | Базовые стили (Tailwind + Leaflet) |
| `src/vite-env.d.ts` | Типы для Vite env variables |
| `src/lib/supabase.ts` | Supabase клиент |
| `src/types/index.ts` | User, Message, UserLocation типы |
| `src/types/supabase.ts` | Database types для Supabase |
| `src/store/authStore.ts` | Авторизация (Google OAuth) |
| `src/store/chatStore.ts` | Чат (Realtime) |
| `src/store/locationStore.ts` | Геолокация |
| `src/pages/MapPage.tsx` | Карта |
| `src/pages/ChatPage.tsx` | Чат |
| `src/pages/ProfilePage.tsx` | Профиль |
| `src/pages/AuthPage.tsx` | Страница авторизации |
| `src/pages/AuthCallbackPage.tsx` | OAuth redirect handler |
| `src/components/ui/BottomNav.tsx` | Нижняя навигация |
| `src/i18n/index.ts` | Переводы RU/BE/EN |
