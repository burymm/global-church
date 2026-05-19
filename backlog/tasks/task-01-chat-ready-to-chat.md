# task-01 — Чат только при взаимном статусе "Готов пообщаться"

## Описание
Добавить возможность чата между пользователями, у которых установлен статус "Готов пообщаться" (readyToChat). Иконка чата появляется в попапе на карте только если у обоих статус совпадает. Если чат уже был начат, он остаётся доступным из вкладки Chat (даже если статус убран). Добавить возможность удаления чата.

## Изменения

### Маршрутизация
- `/chat` — список чатов
- `/chat/:userId` — чат с конкретным пользователем

### MapPage.tsx
- Убрать прямой переход в чат при клике на маркер
- PopupContent: 💬 кнопка через navigate(`/chat/${userId}`) только если у обоих есть `readyToChat` и это не свой маркер
- GroupPopupContent: 💬 иконка + навигация в чат только при взаимном `readyToChat`

### chatStore.ts
- `deleteConversation(userId)` — удаляет все сообщения между пользователями
- `sendMessage` — теперь возвращает `select().single()` и добавляет в локальный `messages` (оптимистичное обновление)
- Подписка — уникальное имя канала `chat-${userId}-${Date.now()}`, защита от дубликатов сообщений
- `unsubscribe`/`setActiveUser` — сделаны `async`, дожидаются очистки канала
- Все вставки в `messages` проверяют `some((m) => m.id === ...)` во избежание дубликатов

### ChatPage.tsx
- Чтение `userId` из URL-параметров (useParams)
- Гард доступа: существующий чат → пускает; нет чата, но оба с `readyToChat` → пускает; юзер не найден → "Пользователь не найден"; нет доступа → "Чат недоступен"
- Имя собеседника: сначала из `conversations`, если нет — запрос к `users` таблице
- 🗑 кнопка удаления чата
- `ConfirmDialog` вместо `window.confirm`
- `max-w-[85%]` + `break-words` для длинных сообщений

### App.tsx
- Добавлен роут `/chat/:userId`
- `pb-20` на контейнере роутов (отступ от BottomNav)

### i18n
- Новые ключи: `deleteChat`, `deleteConfirm`, `userNotFound`, `chatUnavailable`

### components/ConfirmDialog.tsx
- Новый компонент на `@headlessui/react` DialogPanel с анимацией

### supabase/schema.sql
- Добавлен DELETE policy на messages: `auth.uid() = sender_id OR auth.uid() = recipient_id`
- Добавлен UPDATE policy на messages: `auth.uid() = sender_id OR auth.uid() = recipient_id`
- Добавлен `GRANT DELETE ON messages TO authenticated`
- Добавлена колонка `status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'))` (миграция)

### Статусы сообщений
- `markAsDelivered(messageId)` — вызывается при получении сообщения через Realtime (получатель)
- `markAsRead(userId)` — вызывается при открытии чата с пользователем
- Подписка на UPDATE realtime (sender_id = currentUser) — отслеживает изменения статуса отправленных
- UI: ✓ (sent) / ✓✓ (delivered) / ✓✓ синяя (read) под своими сообщениями
- Галочки сдвинуты `-ml-[0.4rem]`

## Статус
✅ Готово — [commit ref pending]

## Важно — миграция БД
Выполнить в Supabase SQL Editor:
```sql
ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));
UPDATE messages SET status = 'read' WHERE is_read = TRUE AND (status IS NULL OR status = 'sent');
UPDATE messages SET status = 'sent' WHERE is_read = FALSE AND status IS NULL;

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
```
