# Pozitiv — personal portfolio / личное портфолио

**RU** — Личный сайт-визитка: интерактивный 3D-экран из частиц, проекты, резюме. Двуязычный (RU / EN), чистый HTML + CSS + JS, без сборки и зависимостей.
**EN** — Personal portfolio site: an interactive 3D particle hero, projects and a résumé. Bilingual (RU / EN), plain HTML + CSS + JS, no build step, no dependencies.

## Run locally / Запуск

```bash
python3 -m http.server 8000
# открой / open http://localhost:8000
```

`index.html` можно открыть и двойным кликом / can also be opened directly from disk.

## Edit content / Где править

| What / Что | Where / Где |
|---|---|
| Projects, skills, contacts, experience / Проекты, навыки, контакты, опыт | `assets/js/data.js` |
| UI texts RU / EN / Тексты интерфейса | `assets/js/i18n.js` |
| Particle shapes / Формы частиц | `assets/js/hero.js` |
| Styles / Стили | `assets/css/style.css` |

## Deploy / Публикация

Create a repository named `Pozitivstek.github.io`, push this folder to `main`, then enable
**Settings → Pages → Deploy from a branch → main / (root)**. The site appears at
`https://pozitivstek.github.io`.

Создай репозиторий `Pozitivstek.github.io`, запушь в него эту папку и включи
**Settings → Pages → Deploy from a branch → main / (root)**.
