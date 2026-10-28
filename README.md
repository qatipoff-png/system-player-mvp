# SYSTEM Player Dashboard — MVP

A dark RPG-style habit tracker built with Next.js 14, React, TypeScript and Tailwind CSS. Saves progress in browser LocalStorage (single browser/device, no account sync).

## Run locally

Requirements: Node.js 18.17+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Included
- Player profile, level and XP bar. XP required per level: `100 + (level - 1) * 50`.
- STR / INT / END / DISC stats; each level gives 3 stat points.
- Daily quests, EXP and Gold rewards, custom quest modal.
- Reward shop with Gold spending.
- Activity log and 28-day activity map.
- LocalStorage persistence and daily date rollover check.

## Notes / next steps
- LocalStorage is not a secure or synced database. Clearing browser data resets progress; use Supabase for authentication, cross-device sync and reliable server-side daily resets.
- MVP daily rollover applies a 10 HP penalty on the next visit after a date change. For production, use a server-side scheduled job and store each day's result in the database.
- Add sound effects with an opt-in toggle and use a real notification system only after browser permission.
- `crypto.randomUUID()` is supported in modern browsers.
