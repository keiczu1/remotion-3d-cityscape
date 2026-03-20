# Инструкции для Claude

Сначала прочитай `AGENTS.md` в корне репозитория — это главный session-контракт.

Затем прочитай `docs/README.md` как карту активной документации.

## Skills

Все skills находятся в `.agents/skills/`. Читай `SKILL.md` каждого skill, когда он подходит по описанию:

- `.agents/skills/justdoit/SKILL.md` — используй по умолчанию почти для любой нетривиальной задачи в репозитории.
- `.agents/skills/ranking-corridor-launch/SKILL.md` — используй, когда пользователь приходит с новой темой и нужно дойти только до `launch-card`.
- `.agents/skills/ranking-corridor-production/SKILL.md` — используй, когда у проекта уже есть `launch-card` или готовый project-container и нужно продолжить рабочий цикл.
- `.agents/skills/remotion-best-practices/SKILL.md` — используй всегда, когда меняется Remotion-композиция, тайминг, 3D-сцена, ассеты или поведение рендера.

## Язык

Все ответы на русском языке. Исключения только для кода, команд, путей, URL, API и названий пакетов.
