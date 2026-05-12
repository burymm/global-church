# Рефакторинг кода — типизация, консистентность, производительность

## Описание
Аудит выявил системные проблемы: отсутствие точек с запятой в `MapPage.tsx`, дублирование кода, слабая типизация (`any`), неполные зависимости в хуках, утечки производительности, несогласованный стиль.

---

## 🔴 Критические

### 1. `MapPage.tsx` — нет `;` нигде
Файл полностью нарушает конвенцию проекта (semicolons required). Сотни строк без завершающих точек с запятой — на каждом импорте, выражении, return.

### 2. `ProfilePopup.tsx` + `ProfilePage.tsx` — ~80% дублирования
Константы (`emojis`, `denominations`, `interests`, `statuses`, `languages`) и функция `toggle` скопированы в оба файла. Вынести в `src/lib/profileConstants.ts`.

### 3. `MapPage.tsx:233` — `groupLocations()` O(n²) на каждый рендер
Вызов `groupLocations(userLocations)` без `useMemo`. При росте числа пользователей будет лаг.

### 4. `chatStore.ts:48-57` — список диалогов сломан
Запрос к `messages` без JOIN/JOIN с `users` — `other_user.display_name` всегда пустой. Все диалоги показывают "User".

### 5. `MapPage.tsx:203-210` — missing deps в useEffect
- `useEffect(() => { startHeartbeat(); ... }, [])` — `startHeartbeat`, `stopHeartbeat` не в deps
- `useEffect(() => { if (currentUser?.is_sharing_location) startSharing(); }, [])` — `currentUser`, `startSharing` не в deps

---

## 🟡 Средние

### 6. `authStore.ts:31-43` — сырой `fetch()` вместо Supabase SDK
Вручную конструирует URL `rest/v1/users` с заголовками. Во всём остальном коде используется `supabase.from('users').select()`. Нужно заменить на SDK-запрос.

### 7. `authStore.ts:7` — `session: any`
Типизировать как `Session | null` из `@supabase/supabase-js`.

### 8. `chatStore.ts` — тотальный `any`
- `conversations: any[]` → нужен `Conversation[]`
- `_channel: any` → `RealtimeChannel`
- `data as Message[]` → нужна проверка
- `new Map()` → типизировать
- `state as any` → убрать после типизации `_channel`

### 9. `PwaInstallPrompt.tsx` + `BottomNav.tsx` — дубликат `isStandalone`
Логика проверки standalone скопирована в два файла. Вынести в `src/lib/isStandalone.ts`.

### 10. `ChatPage.tsx:35` — хардкод `'ru'` для форматирования времени
`toLocaleTimeString('ru', ...)` → `toLocaleTimeString(i18n.language, ...)`.

### 11. `locationStore.ts:33,42-48` — unsafe casts
`(me?.blocked_user_ids as string[])` и `(u: any)` в filter/map — нет типовой безопасности.

---

## 🟢 Мелкие

### 12. `locationStore.ts:105` — пустой колбэк ошибки геолокации
Геолокация может быть запрещена или timeout — ошибка молча проглатывается.

### 13. `locationStore.ts:100` — `fetchOnlineLocations()` без `await`
Fire-and-forget внутри `async`-функции.

### 14. `AuthCallbackPage.tsx:14,39` — `session: any`
Параметр `upsertUser` и колбэк `onAuthStateChange` используют `any`.

### 15. `ProfilePopup.tsx:55-59` / `ProfilePage.tsx:53-56` — `updateUser` без `await`
Асинхронный вызов без обработки результата/ошибки.

### 16. `ChatPage.tsx:16-20` — `sendMessage` без `await`

### 17. `vite-env.d.ts` — нет `;`
Все 6 property declarations в интерфейсе без `;`.

### 18. `MapPage.tsx` — `any[]` для `groupLocations`
Параметр `locations: any[]` и возврат `any[]`. Должен быть `UserLocation[]` и `(UserLocation | UserLocation[])[]`.

### 19. `MapPage.tsx` — `any` в пропсах попапов
`{ members: any[] }`, `{ loc: any }` — потеря типовой безопасности.

### 20. `MapPage.tsx:114` — утечка i18n listener
`i18n.on('languageChanged', render)` без `i18n.off` — при каждой смене deps цепляется новый listener, старый не отвязывается.

---

## Файлы для изменений
- `src/pages/MapPage.tsx` — `;`, useMemo, deps, типы, i18n listener
- `src/components/ProfilePopup.tsx` — вынести константы
- `src/pages/ProfilePage.tsx` — вынести константы
- `src/store/authStore.ts` — fetch → SDK, `any` → `Session | null`
- `src/store/chatStore.ts` — Conversation interface, типы, JOIN для имён
- `src/store/locationStore.ts` — типы, ошибка геолокации
- `src/components/PwaInstallPrompt.tsx` — вынести `isStandalone`
- `src/components/ui/BottomNav.tsx` — вынести `isStandalone`
- `src/pages/ChatPage.tsx` — `i18n.language`, await
- `src/pages/AuthCallbackPage.tsx` — типы
- `src/vite-env.d.ts` — `;`
- `src/lib/profileConstants.ts` — **новый файл**
- `src/lib/isStandalone.ts` — **новый файл**
