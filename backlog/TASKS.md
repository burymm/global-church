# Tasks — Global Church

## Completed

| # | Task | Commit | Docs |
|---|------|--------|------|
| 1 | Create project documentation | [`d409f10`](https://github.com/burymm/global-church/commit/d409f10) | [backlog/docs/01-project-overview.md](backlog/docs/01-project-overview.md) |
| 2 | Add README | [`a605566`](https://github.com/burymm/global-church/commit/a605566) | [README.md](README.md) |
| 3 | Initialize project (auth, map, chat, profile, PWA) | [`ed29deb`](https://github.com/burymm/global-church/commit/ed29deb) | [backlog/docs/06-task-initialization.md](backlog/docs/06-task-initialization.md) |
| 4 | Add rules for AI agents | [`65b6b35`](https://github.com/burymm/global-church/commit/65b6b35) | [CLAUDE.md](CLAUDE.md) · [.cursorrules](.cursorrules) |
| 5 | [bug-01] — Fix language resets to Russian | [`7b12c93`](https://github.com/burymm/global-church/commit/7b12c93) | [backlog/bugs/01-language-resets-to-russian.md](backlog/bugs/01-language-resets-to-russian.md) |
| 6 | [bug-02] — Fix location sharing state lost on reload | [`8b48a14`](https://github.com/burymm/global-church/commit/8b48a14) | [backlog/bugs/02-location-sharing-state-lost-on-reload.md](backlog/bugs/02-location-sharing-state-lost-on-reload.md) |
| 7 | [bug-03] — Code refactoring (types, semicolons, deps) | [`9db4d87`](https://github.com/burymm/global-church/commit/9db4d87) | [backlog/bugs/03-code-refactoring.md](backlog/bugs/03-code-refactoring.md) |
| 8 | [task-01] — Chat with mutual readyToChat status, delivery/read status, delete chat | [`459580d`](https://github.com/burymm/global-church/commit/459580d) | [backlog/tasks/task-01-chat-ready-to-chat.md](backlog/tasks/task-01-chat-ready-to-chat.md) |
| 9 | [bug-04] — Fix Supabase 404, ErrorBoundary, try/catch on queries, vercel.json | [`9f3999c`](https://github.com/burymm/global-church/commit/9f3999c) + [`886b1dd`](https://github.com/burymm/global-church/commit/886b1dd) | [backlog/bugs/04-supabase-404-not-found.md](backlog/bugs/04-supabase-404-not-found.md) |
| 10 | [task-02] — Unread badge, auto-refresh conversations, global Realtime subscription | [`e9273f8`](https://github.com/burymm/global-church/commit/e9273f8) + [`ea5405c`](https://github.com/burymm/global-church/commit/ea5405c) | [backlog/tasks/task-02-unread-message-badge.md](backlog/tasks/task-02-unread-message-badge.md) |

## Planned (Roadmap)

### Фаза 1 — MVP
- [x] Auth + Map + Chat + Profile
- [x] Finish initialization checks
- [x] Deploy to Vercel
- [ ] Test with 2 accounts (location + chat)

### Фаза 2 — Улучшение UX
- [ ] Online/offline status
- [ ] Marker clustering (prototype done, needs polish)
- [ ] Smooth marker animation
- [ ] Map filters (pray together, home group seekers)
- [ ] Status badges on markers
- [ ] Web Push notifications
- [ ] Auto-detect browser language
- [ ] Empty state screen
- [ ] Performance optimizations
- [ ] Offline fallback
- [ ] Release notes & app version screen
- [x] [task-03](tasks/task-03-notifications.md) — Sound & browser notifications for new messages

### Фаза 3 — Масштабирование
- [ ] [task-04](tasks/task-04-web-push-notifications.md) — Web Push уведомления (iOS 16.4+ / Android)
- [ ] Manual city selection (no GPS)
- [ ] Group chats
- [ ] Announcements
- [ ] Search by name/denomination/interests
- [ ] Nearby churches on map
- [ ] Moderation and reports
- [ ] Infinite scroll for chats
- [ ] Metrics/analytics
- [ ] Docker containerization
- [ ] CI/CD (GitHub Actions)

### Фаза 4 — Полноценная платформа
- [ ] Other OAuth providers (Apple, Telegram)
- [ ] Group chats with files/voice
- [ ] Events/meetings
- [ ] Push notifications (Firebase/Web Push)
- [ ] Admin panel
- [ ] Verification badges
- [ ] Admin analytics
- [ ] Dark mode

### Фаза 5 — Монетизация
- [ ] Premium statuses
- [ ] Church pages
- [ ] Donations
- [ ] No ads policy

---

See full roadmap: [backlog/docs/04-roadmap.md](backlog/docs/04-roadmap.md)
