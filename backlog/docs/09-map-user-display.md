# Задача: Отображение пользователей на карте

## Описание

Показывать на карте маркеры всех пользователей, которые делятся геолокацией. При клике на маркер — попап с именем, аватаром, статусами. При клике в пустое место — закрыть попап. Запрос геолокации у пользователя (браузерное разрешение). Обновление онлайн-статуса раз в минуту.

## Текущее состояние

| Что есть | Что не работает |
|----------|-----------------|
| Маркер `✝` с иконкой | В попапе написано "Пользователь" — нет имени, аватара |
| Кнопка "Поделиться" / "Остановить" | Нет проверки разрешения геолокации от браузера |
| `fetchOnlineLocations()` — фильтр по `is_sharing_location = TRUE` | Нет проверки `blocked_user_ids` |
| Полноэкранная карта с Leaflet | `is_online` не обновляется |

## Что нужно сделать

### 1. Запрос разрешения геолокации

Когда пользователь нажимает "Поделиться" — браузер показывает нативный диалог **"Разрешить доступ к местоположению?"**. Это работает одинаково в:

- **Браузере** (Chrome, Safari, Firefox) — `navigator.geolocation.getCurrentPosition()` → системный диалог
- **PWA** (установлено на телефон) — то же API, но важно:
  - **HTTPS** обязателен для `navigator.geolocation` (кроме localhost)
  - На **iOS Safari PWA** (`standalone` mode) геолокация может не работать — нужно открывать через `window.location` или показывать подсказку "Откройте в Safari"

**Что сделать:**

```typescript
// В locationStore — сначала проверяем разрешение
async requestLocationPermission() {
  // navigator.permissions.query работает в Chrome, но не в Safari
  // Самый надёжный — просто вызвать watchPosition, браузер сам покажет диалог
  // Если уже заблокировано — показать подсказку
  if (navigator.permissions) {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    if (result.state === 'denied') {
      // Показать модал: "Геолокация заблокирована. Откройте Настройки → Конфиденциальность"
      return false
    }
  }
  return true
}
```

**Подсказка для пользователя:**

- Если `permission: denied` → показать экран "Разрешите геолокацию в настройках"
- Если `permission: granted` → начать показ геолокации
- Если `permission: prompt` → показать нативный диалог

### 2. Попап по клику (и закрытие по клику)

Сейчас Leaflet Popup открывается по клику автоматически — так и оставить. Дополнительно — закрытие при клике в пустое место карты:

```tsx
<MapContainer onClick={() => setActiveUser(null)} ...>
  <Marker
    position={[lat, lng]}
    eventHandlers={{
      click: () => setActiveUser(user_id),
    }}
  >
    <Popup isOpen={activeUser === user_id}>
      <div className="text-center">
        <img src={user.avatar_url} className="w-10 h-10 rounded-full mx-auto" />
        <p className="font-medium">{user.display_name}</p>
        {user.denomination && <p className="text-xs text-gray-500">{user.denomination}</p>}
        {user.statuses?.length > 0 && <p className="text-xs mt-1">{user.statuses.join(' · ')}</p>}
      </div>
    </Popup>
  </Marker>
</MapContainer>
```

**Контент попапа:**
- Аватар (если есть)
- Имя (`display_name`)
- Конфессия (`denomination`)
- Статусы (`statuses`)

Пока **все пользователи** — фильтр по статусам добавим позже.

### 3. Онлайн-статус (раз в минуту)

Вместо realtime — обновление раз в минуту.

```typescript
// При входе на страницу
useEffect(() => {
  // Сразу: я онлайн
  supabase.from('users').update({ is_online: true }).eq('id', session.user.id)

  // Каждую минуту: "я всё ещё здесь"
  const heartbeat = setInterval(() => {
    supabase.from('users').update({ is_online: true }).eq('id', session.user.id)
  }, 60_000)

  // При уходе: я оффлайн
  return () => {
    clearInterval(heartbeat)
    supabase.from('users').update({ is_online: false, last_seen_at: new Date().toISOString() }).eq('id', session.user.id)
  }
}, [])
```

**Таймаут бездействия:** в БД — проверка по `last_seen_at`. Если > 3 минут назад → считается оффлайн. Это делается на уровне запроса:

```sql
SELECT *, (NOW() - last_seen_at < INTERVAL '3 minutes') AS is_online
FROM users
WHERE is_sharing_location = TRUE
  AND location_lat IS NOT NULL
```

Или просто проверяем `is_online = TRUE` + проверяем `last_seen_at < 3 min` на клиенте.

**Примечание для roadmap:** интервал обновления и таймаут должны быть настраиваемыми в настройках профиля (по умолчанию: 1 мин / 3 мин).

### 4. Блокировка пользователей

При запросе маркеров — исключать тех, кого я заблокировал:

```typescript
const { data: me } = await supabase
  .from('users')
  .select('blocked_user_ids')
  .eq('id', session.user.id)
  .single()

const blocked = me?.blocked_user_ids || []
const locations = (data || []).filter(u => !blocked.includes(u.id))
```

### 5. Свой маркер

Текущий пользователь тоже виден на карте если делится геолокацией. Выделить другим цветом/обводкой:

```tsx
const isMe = (user_id === currentUser.id)

function userIcon(isMe: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${isMe ? '#10b981' : '#3b82f6'};width:28px;height:28px;border-radius:50%;border:3px solid ${isMe ? '#059669' : 'white'};box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">✝</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  })
}
```

## Права и RLS

**База данных:** текущая RLS политика `SELECT ... USING (TRUE)` — любой авторизованный видит всех. Это правильное поведение для карты.

**Права доступа на устройстве:**
- `navigator.geolocation` — требует разрешения от пользователя (нативный диалог)
- HTTPS обязателен для PWA (в production)
- `standalone` mode (PWA installed): геолокация может не работать на iOS Safari → показывать подсказку

## Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `src/store/locationStore.ts` | Обновление `is_online` каждую минуту, проверка разрешения геолокации, `blocked_user_ids` |
| `src/pages/MapPage.tsx` | Попап по клику с именем/аватаром/статусами, свой маркер другим цветом |
| `backlog/docs/04-roadmap.md` | Добавить в фазу 2: настраиваемый интервал heartbeat в настройках |

## Критерии готовности

- [x] При первом клике на "Поделиться" браузер запрашивает разрешение на геолокацию
- [x] Если разрешение отклонено — показана подсказка как включить в настройках
- [x] На карте видны пользователи с включённой геолокацией (все, без фильтра)
- [x] При клике на маркер открывается попап: аватар, имя, конфессия, статусы
- [x] При клике в пустое место — попап закрывается
- [x] `is_online` обновляется раз в минуту
- [x] Свой маркер визуально отличается (зелёный вместо синего)
- [x] Заблокированные пользователи не отображаются
