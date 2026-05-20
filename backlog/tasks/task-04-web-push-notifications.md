# task-04 — Web Push уведомления (iOS 16.4+ / Android)

## Описание
Добавить push-уведомления через Service Worker + Web Push API. После выхода из приложения (свёрнутое или закрытое) пользователь должен получать уведомления о новых сообщениях.

## Мотивация
Сейчас браузерные `Notification` работают только в активной вкладке Safari. В PWA-режиме на iOS (экран «Домой») JS приостанавливается при сворачивании — Realtime не работает, уведомлений нет.

## Что нужно сделать

### 1. Серверная часть (Vercel Serverless / Edge Function)
- Endpoint для подписки: `POST /api/push/subscribe`
- Endpoint для отписки: `POST /api/push/unsubscribe`
- VAPID ключи (генерация через `web-push`)

### 2. База данных (Supabase)
- Таблица `push_subscriptions`:
  - `id UUID PK`
  - `user_id UUID REFERENCES users(id)`
  - `endpoint TEXT NOT NULL`
  - `keys JSONB` (`{ p256dh, auth }`)
  - `created_at TIMESTAMPTZ`
- RLS: только владелец может читать/писать
- Триггер на INSERT в `messages` → Cloud Function отправляет push

### 3. Фронтенд
- `src/utils/pushNotifications.ts`:
  - `subscribePush()` — запрос разрешения, регистрация SW, подписка на push
  - `unsubscribePush()` — отписка
  - Вызов при логине/логауте
- Обработчик push в `sw.ts` / `service-worker.ts`

### 4. PWA
- Убедиться, что Service Worker регистрируется (vite-plugin-pwa уже должен)
- `sw.ts` событие `push` → `self.registration.showNotification()`
- Нажатие на уведомление → открывает чат с отправителем

## Технологии
- `web-push` (npm) — для VAPID и отправки уведомлений
- Vercel Serverless Functions — эндпоинты подписки
- Supabase Database Webhooks — вызов функции при новом сообщении

## Зависимости
- Service Worker уже настроен через `vite-plugin-pwa`
- Требуется Production-домен (HTTPS) — Vercel деплой

## Статус
🟡 В плане (Phase 3 — Масштабирование)
