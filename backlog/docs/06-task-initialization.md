# Задача: Инициализация проекта Global Church

## Описание

Настроить рабочее окружение и запустить приложение локально. Включает создание Supabase проекта, настройку БД, Google OAuth и локальный запуск.

## Чек-лист

### 1. Supabase проект

- [X] Создать аккаунт на [supabase.com](https://supabase.com) (бесплатный план)
- [X] Создать новый проект
- [X] Скопировать Project URL и anon key
- [X] Записать в `.env`:
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=xxx
  ```

### 2. База данных

- [X] Открыть SQL Editor в Supabase Dashboard
- [X] Выполнить SQL из `supabase/schema.sql`:
  - Таблица `users` (профили)
  - Таблица `user_locations` (история геолокации)
  - Таблица `messages` (личные сообщения)
  - Индексы для map-запросов
  - Row Level Security правила
  - Триггер авто-создания профиля при регистрации
  - Supabase Realtime публикация
- [X] Проверить в Table Editor что таблицы созданы: `users`, `user_locations`, `messages`

### 3. Google OAuth

- [X] Supabase Dashboard → Authentication → Providers → Google
- [X] Включить Google Provider
- [X] Создать Google Cloud Console проект ([console.cloud.google.com](https://console.cloud.google.com))
- [X] Настроить OAuth consent screen (тип: External)
- [X] Создать OAuth 2.0 Client ID (Web application)
- [X] Добавить Authorized redirect URIs:
  ```
  https://<PROJECT_REF>.supabase.co/auth/v1/authorize/google/callback
  http://localhost:5173/auth/callback
  ```
- [X] Вставить Client ID и Client Secret в Supabase
- [X] В Supabase Settings → URL Configuration → добавить Site URL и Redirect URLs:
  ```
  Site URL: http://localhost:5173
  Redirect URLs: http://localhost:5173/auth/callback
  ```
- [ ] Для тестирования на мобильных: добавить `http://<локальный-IP>:5173/auth/callback` в Redirect URLs

### 4. Dev Tools для AI-агентов (MCP)

- [x] Установить chrome-devtools-mcp (уже установлен):
  ```
  claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
  ```
- [x] Установить context7 для документации (React/Vite/Supabase):
  ```
  claude mcp add context7 --scope user npx @upstash/context7-mcp@latest
  ```
- [X] Проверить: `claude mcp list` — оба MCP-сервера должны быть ✓ Connected
- [X] **Примечание:** Playwright встроен в Claude Code — отдельный MCP не нужен

### 5. Локальный запуск

- [x] Убедиться что Node.js 20+ установлен
- [x] `npm install`
- [x] Создать `.env` из `.env.example`
- [x] `npm run dev`
- [x] Открыть http://localhost:5173
- [x] Проверить что отображается страница авторизации

### 6. Проверка авторизации

- [x] Нажать "Sign in with Google"
- [x] Авторизоваться через Google аккаунт
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
