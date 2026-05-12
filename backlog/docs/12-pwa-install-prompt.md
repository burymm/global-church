# PWA — кнопка установки приложения

## Идея

Добавить кнопку/баннер «Установить приложение», которая появляется, если пользователь открыл сайт в браузере (не в PWA). Нажатие — открывает нативный диалог установки PWA.

Если приложение уже запущено как PWA (standalone mode) — кнопка скрыта.

## Что нужно сделать

### 1. Отслеживание `beforeinstallprompt` (Android)

В браузерах на Android (Chrome) есть событие `beforeinstallprompt`, которое можно перехватить и показать свою кнопку вместо стандартного баннера.

```typescript
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Показать кнопку установки
});
```

При клике на кнопку:
```typescript
deferredPrompt.prompt();
const result = await deferredPrompt.userChoice;
deferredPrompt = null;
```

### 2. Определение iOS (Safari)

На iOS нет события `beforeinstallprompt`. Установка PWA делается через «Поделиться» → «На экран «Домой»». Можно показать инструкцию (popup/баннер) с картинками шагов.

### 3. Определение, запущено ли уже как PWA

```typescript
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as any).standalone === true;
```

Если `isStandalone === true` — ничего не показывать.

### 4. UI кнопки

- **Android:** маленький баннер внизу экрана (над BottomNav) или тост «📲 Установить приложение»
- **iOS:** popup с инструкцией (текст + скриншоты шагов)
- **Desktop:** тоже поддерживается PWA на Chrome/Edge — предлагать установку

### 5. Логика отображения

| Условие | Действие |
|---------|----------|
| Уже PWA (standalone) | Ничего |
| Android Chrome, `beforeinstallprompt` получен | Показать кнопку |
| iOS | Показать инструкцию (после входа) |
| Другой браузер без PWA | Скрыть |

### 6. Отслеживание установки

После установки кнопка скрывается. `beforeinstallprompt` не будет срабатывать повторно.

## Файлы для изменения

| Файл | Что делать |
|------|-----------|
| `src/components/PwaInstallPrompt.tsx` | Новый компонент с логикой отображения и кнопкой |
| `src/App.tsx` | Добавить `<PwaInstallPrompt />` в разметку |
| `src/i18n/index.ts` | Добавить ключи для текста кнопки/инструкции |
