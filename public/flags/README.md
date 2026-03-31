# Shared Flags

`public/flags/` хранит общий набор флагов для ranking-corridor проектов.

Что лежит здесь:
- legacy `png`-ассеты, оставленные в репозитории как исторический след старых проектов
- полный `svg`-набор флагов мира в пропорции `4x3`, который теперь считается единым shared baseline для новых и текущих datasets

Источник `svg`-набора:
- `flag-icons` by `lipis`
- source snapshot imported into this repo from the public `flags/4x3` set

Политика резолва:
- все country codes по умолчанию берутся как `svg`

Если в будущем нужен новый raster-baseline для конкретной страны, его можно добавить как `png` и обновить resolver в `src/assets/flag-asset-url.ts`.
