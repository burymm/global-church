# Global Church

Mobile PWA app for Christians to connect, pray together, and find community.

## What is it?

Global Church helps you find Christians nearby for prayer, fellowship, Bible study, and home groups. Open to Christians of all denominations — and to anyone who wants to connect with Christians.

### Features (v1)

- **Map** — see nearby users sharing their location
- **Chat** — direct messages, real-time delivery
- **Profile** — denomination, interests, and status ("Ready to pray", "Looking for home group", etc.)
- **PWA** — install on your phone without app store
- **3 languages** — Russian, Belarusian, English

### Tech Stack

React + TypeScript + Vite · Tailwind CSS · Leaflet + OpenStreetMap · Supabase (Auth + PostgreSQL + Realtime) · Zustand · i18next

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account (free tier)

### Setup

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor
2. Enable Google OAuth in Supabase Dashboard
3. Copy `.env.example` to `.env` and fill in your Supabase credentials
4. Install dependencies and start:

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Documentation

Project documentation is in `backlog/docs/`:

| File | Description |
|------|-------------|
| `01-project-overview.md` | Project description, goals, features |
| `02-technology-stack.md` | Technology choices and alternatives |
| `03-architecture.md` | Project structure, routing, data flow |
| `04-roadmap.md` | Development roadmap (5 phases) |
| `05-architecture-decisions.md` | Abstract service layers for future migration |
| `06-task-initialization.md` | Setup checklist |
| `07-dev-guidelines.md` | Git, naming, commit conventions |

---

# Global Church (русский)

Мобильное PWA-приложение для знакомства и общения христиан.

## Что это?

Global Church помогает найти христиан рядом для совместной молитвы, общения, изучения Библии и домашних групп. Приложение открыто для христиан всех конфессий — и для тех, кто хочет познакомиться с христианами.

### Возможности (v1)

- **Карта** — видны пользователи, которые делятся местоположением
- **Чат** — личные сообщения с доставкой в реальном времени
- **Профиль** — конфессия, интересы, статусы ("Готов помолиться", "Ищу домашнюю группу" и т.д.)
- **PWA** — установка на телефон без App Store и Google Play
- **3 языка** — русский, белорусский, английский

### Технологии

React + TypeScript + Vite · Tailwind CSS · Leaflet + OpenStreetMap · Supabase (Auth + PostgreSQL + Realtime) · Zustand · i18next

## Быстрый старт

### Требования

- Node.js 20+
- Аккаунт на Supabase (бесплатный план)

### Настройка

1. Создайте проект на Supabase и выполните `supabase/schema.sql` в SQL Editor
2. Включите Google OAuth в Supabase Dashboard
3. Скопируйте `.env.example` в `.env` и заполните данные Supabase
4. Установите зависимости и запустите:

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

### Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запустить dev-сервер с hot reload |
| `npm run build` | Сборка для продакшна |
| `npm run preview` | Предпросмотр продакшн-сборки |

## Документация

Документация проекта в `backlog/docs/`:

| Файл | Описание |
|------|----------|
| `01-project-overview.md` | Описание проекта, цели, функциональность |
| `02-technology-stack.md` | Выбор технологий и альтернативы |
| `03-architecture.md` | Структура, роутинг, потоки данных |
| `04-roadmap.md` | Дорожная карта разработки (5 фаз) |
| `05-architecture-decisions.md` | Абстрактные слои для миграции |
| `06-task-initialization.md` | Чек-лист настройки проекта |
| `07-dev-guidelines.md` | Правила: git, именование, коммиты |
