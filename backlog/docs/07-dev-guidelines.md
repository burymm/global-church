# Гайдлайны разработки

## Коммиты

### Формат

```
[<номер задачи>] — <краткое описание>
```

**Примеры:**

```
[01] - create project structure
[02] - add auth store and auth page
[03] - implement map page with leaflet
[04] - add chat functionality with realtime
[05] - implement profile page
[06] - setup dev tools and MCP servers
```

### Правила

- Номер задачи = номер файла в `backlog/docs/` (например, `06-task-initialization.md` → `[06]`)
- После тире — краткое описание на английском (что было сделано)
- Один коммит = одно логическое изменение
- Не коммить `node_modules`, `.env`, `dist`

### Git flow

- `master` — главная ветка, всегда рабочая (продакшн-готовая)
- `dev` — рабочая ветка разработки, PR из feature-веток мёржатся сюда
- `feature/<описание>` — для больших изменений (опционально)
- `release/*` — релизные ветки (с фазы 2)

### Flow

```
feature/chat-realtime → dev → master
```

- Фаза 1: коммиты в `dev`, с `dev` мёржим в `master` когда стабильно
- Фаза 2+: добавляются `release/*` ветки и feature-флаги

## Структура кода

### Алфавитный порядок

Файлы и папки — по алфавиту, без префиксов типа `use` для хуков или `App` для компонентов.

### AI-агенты

- Все AI-агенты пишут типизированный TypeScript
- Не добавлять комментарии, объясняющие WHAT (код и так понятен)
- Добавлять комментарии только для WHY (почему сделано именно так)
- Не добавлять fallback-код для случаев, которые не могут произойти
- Не добавлять error handling для ситуаций, которые framework покрывает

### Импорты

Группировка импортов:
1. npm пакеты (react, zustand, и т.д.)
2. внутренние типы (`../types/...`)
3. внутренние хуки и компоненты
4. стили (`../index.css`)

## Именование

| Что | Стиль | Пример |
|-----|-------|--------|
| Файлы | camelCase | `authStore.ts`, `mapService.ts` |
| Компоненты | PascalCase | `MapPage`, `BottomNav` |
| Store | camelCase + Store | `authStore`, `chatStore` |
| Функции/хуки | camelCase | `fetchMessages`, `useAuth` |
| Константы | UPPER_CASE для config | `DEFAULT_CENTER`, `UPDATE_INTERVAL` |
| Интерфейсы | PascalCase | `AuthService`, `User` |
| Папки | camelCase | `components`, `pages`, `providers`, `store` |

## Среда разработки

- Node.js 20+
- Prettier (опционально — AI-агенты и так форматируют)
- ESLint включён через конфигурацию Vite
