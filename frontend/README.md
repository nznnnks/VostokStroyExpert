# Stayse Frontend

Этот репозиторий теперь содержит два каталога:

- `frontend/` — Astro + Tailwind фронтенд.
- `backend/` — пока пусто.

## Запуск (frontend)

```bash
cd frontend
npm install
npm run dev
```

Открой в браузере: `http://localhost:4321/`.

## Основные страницы (frontend)

- `/` — главная.
- `/catalog` — каталог.
- `/catalog/[slug]` — карточка товара.
- `/cart` — корзина.
- `/checkout` — оформление.
- `/login` — вход.
- `/register` — регистрация.
- `/code` — ввод кода.
- `/account` — личный кабинет.
- `/admin` — админка (и разделы `/admin/requests`, `/admin/orders`, `/admin/clients`, `/admin/news`, `/admin/catalog`, `/admin/projects`, `/admin/settings`).

## Ассеты

Ожидаемые папки (frontend):

- `frontend/public/assets/stayse/hero`
- `frontend/public/assets/stayse/logos`
- `frontend/public/assets/stayse/services`
- `frontend/public/assets/stayse/blog`
- `frontend/public/assets/stayse/reviews`
