# Архитектурные решения: Абстрактные слои

## Зачем

Мы начинаем с бесплатных инструментов (Supabase, OpenStreetMap), но при росте может понадобиться:

- Заменить Supabase → свой Node.js бэкенд (Express/Fastify)
- Заменить OpenStreetMap → Google Maps API (при масштабировании)
- Заменить Supabase Auth → Auth0 / Clerk / кастомный Auth

Чтобы замена прошла без переписывания страниц и компонентов, все внешние API скрыты за интерфейсами.

## Схема

```
┌───────────────────────────────────────────────┐
│  Pages (MapPage, ChatPage, ProfilePage)       │
│  - Не знают как данные приходят               │
│  - Вызывают методы через интерфейсы            │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│  Services (интерфейсы)                        │
│  - AuthService                                 │
│  - DataService (CRUD)                          │
│  - RealtimeService (подписки)                  │
│  - MapService (карты)                          │
│  - LocationService (геолокация)                │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│  Providers (реализации)                       │
│  - SupabaseAuthProvider / NodeAuthProvider    │
│  - SupabaseDataProvider / RestDataProvider    │
│  - LeafletMapProvider / GoogleMapProvider     │
└───────────────────────────────────────────────┘
```

## Интерфейсы

### AuthService

```typescript
interface AuthService {
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  getSession(): Promise<Session | null>
  onAuthStateChange(callback: (event, session) => void): Unsubscribe
}
```

**Реализации:**
- `SupabaseAuthProvider` — `supabase.auth.signInWithOAuth()`
- `NodeAuthProvider` — `fetch('/api/auth/google')` (на будущее)

### DataService

```typescript
interface DataService {
  // Users
  getUsers(options?: { onlineOnly?: boolean }): Promise<User[]>
  getUser(id: string): Promise<User | null>
  updateUser(id: string, data: Partial<User>): Promise<void>

  // Messages
  getMessages(userId: string, limit?: number): Promise<Message[]>
  sendMessage(senderId: string, recipientId: string, content: string): Promise<void>

  // Locations
  getSharedLocations(): Promise<UserLocation[]>
  updateLocation(userId: string, lat: number, lng: number): Promise<void>
}
```

**Реализации:**
- `SupabaseDataProvider` — `supabase.from('...').select()`
- `RestDataProvider` — `fetch('/api/users')`, `fetch('/api/messages')`

### RealtimeService

```typescript
interface RealtimeService {
  subscribeToMessages(userId: string, callback: (message: Message) => void): Unsubscribe
  subscribeToLocations(callback: (location: UserLocation) => void): Unsubscribe
  unsubscribe(channel: string): void
}
```

**Реализации:**
- `SupabaseRealtimeService` — `supabase.channel('...').on('INSERT', ...)`
- `WebSocketRealtimeService` — `new WebSocket('/ws')` (на будущее)

### MapService

```typescript
interface MapContainer {
  addMarker(latLng: [number, number], options?: MarkerOptions): void
  removeMarker(id: string): void
  clearMarkers(): void
  fitToUsers(): void
  getInstance(): any // Leaflet map / Google map instance
}

interface MapService {
  createMap(container: HTMLElement): MapContainer
  // Утилиты (не зависят от провайдера)
  clusterMarkers(locations: UserLocation[]): ClusteredMarker[]
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number
}
```

**Реализации:**
- `LeafletMapProvider` — `L.map()`, `L.marker()`, `leaflet.markercluster`
- `GoogleMapProvider` — `new google.maps.Map()`, `new google.maps.Marker()`

### LocationService

```typescript
interface LocationService {
  getCurrentPosition(): Promise<{ lat: number; lng: number; accuracy: number }>
  watchPosition(callback: (pos: { lat: number; lng: number; accuracy: number }) => void): WatchId
  clearWatch(watchId: WatchId): void
}
```

**Реализации:**
- `BrowserGeolocationProvider` — `navigator.geolocation` (единственный вариант)

## Как это используется в коде

Store обращается к интерфейсу, а не к конкретной реализации:

```typescript
// ✅ Правильно — через интерфейс
import { dataService } from '../lib/services'

await dataService.sendMessage(senderId, recipientId, content)

// ❌ Неправильно — напрямую
import { supabase } from '../lib/supabase'
await supabase.from('messages').insert({ ... })
```

Провайдеры инджектятся при инициализации:

```typescript
// src/lib/services.ts
import { AuthService } from '../services/authService'
import { SupabaseAuthProvider } from '../providers/supabase/auth'

export const authService: AuthService = new SupabaseAuthProvider()
```

Для смены провайдера — меняем одну строку.

## Когда внедрять

**v1:** Можно писать напрямую через Supabase (быстрый старт). Интерфейсы создать, но без строгого разделения.

**v2-v3:** Когда станет ясно, что замена нужна — создаём альтернативный провайдер и переключаем одну строку в `src/lib/services.ts`.

**Не внедрять преждевременно** абстракции, которые не будут использоваться. Главное — не распылять Supabase-специфичный код по страницам, а держать его в `services/` и `providers/`.
