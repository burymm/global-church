# task-03 — Звуковые уведомления + браузерные нотификации

## Описание
При получении нового сообщения через Realtime:
1. Воспроизводить короткий звуковой сигнал (Web Audio API, без внешних файлов)
2. Если вкладка неактивна (`document.hidden`) — показывать браузерное уведомление (Notification API) с именем отправителя и текстом сообщения

## Изменения

### Настройки (ProfilePopup)
- Добавить переключатели:
  - `🔔 Уведомления` (on/off) — полное отключение браузерных нотификаций
  - `🔊 Звук сообщений` (on/off) — отключение звука при новых сообщениях
- Сохранять в `users.settings` (JSONB колонка) или в отдельных полях `notifications_enabled`, `sound_enabled`

### chatStore.ts
- В Realtime INSERT handler (активный чат): проверять `sound_enabled` → если true и `document.hidden === false` → звук
- В глобальном INSERT handler (чат не активен): проверять `notifications_enabled` → если true и `document.hidden === true` → Notification

### utils/notification.ts (новый файл)
- `playMessageSound()` — генерирует короткий «динь» через Web Audio API (OscillatorNode + GainNode, 800ms, затухание)
- `showNotification(title, body)` — вызывает `Notification.permission === 'granted'` (или запрашивает разрешение) и показывает `new Notification()`

### App.tsx
- При логине запросить `Notification.requestPermission()`

### База данных
- `ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{}'` — или добавить поля `notifications_enabled BOOLEAN DEFAULT TRUE`, `sound_enabled BOOLEAN DEFAULT TRUE`

### i18n
- Ключи: `profile.notifications`, `profile.sound`, `profile.notificationsEnabled`, `profile.soundEnabled`

## Статус
🟡 В плане (ожидает обсуждения)
