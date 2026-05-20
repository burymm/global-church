# Supabase 404: not_found при открытии ссылки

**Описание:** При открытии ссылки (например, `/chat/{userId}`) пользователь видит сообщение:
```
404: not_found
code: 'not_found'
id: 'arn1::2jwr-....'
```

Это **PostgREST HTTP 404** — Supabase возвращает его, когда роль запроса не имеет доступа к таблице (нет GRANT) или таблица не существует.

## Анализ

### 1. Миграция `004-add-table-grants.sql` не накачена на Supabase

В `supabase/schema.sql` и `supabase/004-add-table-grants.sql` есть GRANTs для роли `authenticated`. **Если эта миграция не выполнена на Supabase проекте**, PostgREST не даёт доступ к таблицам даже для аутентифицированных пользователей.

Новый дефолт Supabase (с марта 2024): без явных GRANT (`GRANT ... TO authenticated`) Data API возвращает 404.

**Проверка:** зайти в Supabase Dashboard → SQL Editor → проверить права:
```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('users', 'messages', 'user_locations');
```
Если `authenticated` нет — вот корень проблемы.

### 2. Нет ErrorBoundary на уровне приложения

`src/App.tsx` не обёрнут в ErrorBoundary. Любое необработанное исключение (включая необработанные reject-цепочки из Supabase) может показать сырую ошибку.

### 3. Несколько мест с необработанными Supabase запросами

| Файл | Строка | Что происходит при 404 |
|---|---|---|
| `src/pages/ChatPage.tsx` | 38 | `checkAccess()` — `supabase.from('users').select('statuses')` без try/catch. Promise rejection никак не обработан. |
| `src/pages/ChatPage.tsx` | 83 | fetch `display_name` через `.then()` без `.catch()`. Float-промис. |
| `src/store/locationStore.ts` | 27 | `fetchOnlineLocations()` — `supabase.from('users').select('blocked_user_ids')` без try/catch. |
| `src/store/locationStore.ts` | 35 | `fetchOnlineLocations()` — второй запрос `supabase.from('users').select(...)` без try/catch. |
| `src/store/chatStore.ts` | 49 | `fetchMessages()` — `supabase.from('messages').select(...)` без try/catch. |
| `src/store/chatStore.ts` | 61 | `fetchConversations()` — два запроса без try/catch. |
| `src/store/chatStore.ts` | 75 | `fetchConversations()` — загрузка users. |
| `src/store/chatStore.ts` | 103 | `sendMessage()` — insert без try/catch. |
| `src/store/chatStore.ts` | 116 | `deleteConversation()` — delete без try/catch. |
| `src/store/authStore.ts` | 72 | `updateUser()` — update без try/catch (тут хотя бы silent return если нет session). |

### 4. Отсутствует колонка `status` в таблице `messages`

В `schema.sql` строки 171-174 — закомментированная миграция на добавление колонки `status`. Без неё код в `chatStore.ts` (строки 130, 140) пытается сделать `update({ status: 'delivered' })`, что вызывает ошибку (не 404, а ошибку колонки).

### 5. Нет `vercel.json` для SPA rewrites

В проекте нет `vercel.json` с правилом:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```
Без него прямой переход по `/chat/{userId}` может отдавать Vercel 404. **Но это не объясняет ошибку Supabase** — Vercel 404 и Supabase request_id выглядят по-разному.

## Воспроизведение

1. Открыть ссылку вида `https://{domain}/chat/{userId}` (или любую другую)
2. Если пользователь не аутентифицирован (или сессия протухла), Supabase запросы идут от роли `anon`
3. `anon` не имеет GRANT на таблицы → PostgREST возвращает 404
4. Ошибка не ловится → React показывает сырой `{ code: 'not_found', message: '404: not_found', request_id: 'arn1::...' }`

**Либо:** если проект накатывался без `004-add-table-grants.sql`, то даже `authenticated` роль получает 404 на все таблицы.

## Решение

1. ✅ **Накатил `004-add-table-grants.sql` на Supabase** (через SQL Editor)
2. ✅ **Добавил ErrorBoundary** в `App.tsx`
3. ✅ **Добавил try/catch** во все Supabase запросы (fetchOnlineLocations, checkAccess, fetchMessages, fetchConversations, sendMessage, deleteConversation, updateUser)
4. ✅ **Создал `005-add-messages-status.sql`** для колонки `status` в таблице messages
5. ✅ **Создал `vercel.json`** с SPA rewrites
