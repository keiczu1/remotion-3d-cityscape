# План: library-only конструктор для быстрого запуска `ranking corridor`

## Статус документа

- Тип: рабочий change-plan для будущего ревью
- Слой: `docs/workflow/` и не source-of-truth
- Дата: 2026-04-05
- Основание: пользовательский запрос на перевод launch-процесса из creative-first режима в быстрый library-only конструктор

## Зачем меняется процесс

Текущий workflow уже сильно смещен в сторону `reuse-first`, `registry-first` и `package-first`, но все еще не является строгим режимом `собираем только из библиотеки`.

Из-за этого в продакшн-контур по-прежнему попадают:

- `ai-custom` и `user-custom` варианты на launch-этапе;
- `approved-custom` и `policy reuse: none` в `launch-card`;
- `greenfield-approved` в `build-plan`;
- неявное доращивание новых решений прямо внутри production-проекта.

По ощущению пользователя это приводит к трем проблемам:

1. ИИ слишком легко уходит в свободную генерацию и ошибается.
2. Качество роликов сильнее плавает от проекта к проекту.
3. На старт ролика уходит слишком много времени.

Цель нового режима: превратить старт нового ролика в быстрый `constructor-first` workflow, где ИИ собирает ролик только из уже существующих library-backed модулей и пакетов.

## Что пользователь уже зафиксировал

Ниже не предположения, а уже согласованные product-decisions для нового режима.

### 1. Новый старт ролика

Пользователь хочет писать короткий запрос вида:

- `Новый ролик на тему ...`

После этого ИИ не должен уходить в свободный `concept-pack`, а должен запускать опросник-конструктор.

### 2. Что именно должен спрашивать конструктор

Пользовательский выбор должен идти по таким блокам:

- сколько больших `world-act` у ролика;
- какой мир/фон используется в каждой сцене;
- какая вторичная жизнь используется;
- какой общий характер движения камеры;
- какой `hero package` / вид башни / семейство объекта используется;
- при этом ИИ должен показывать только варианты из библиотеки и отмечать наиболее подходящие для темы.

### 3. Как трактуются сцены

`Сцены` в новом UX означают не технические задачи и не случайные куски `build-plan`, а большие визуально отличимые `world-act` ролика.

Референсы для понимания: ролики наподобие `самые посещаемые сайты` и `самые богатые женщины`, где сцены делятся визуально.

### 4. Как пользователь хочет выбирать мир

Пользователь предпочитает гибридный режим:

- ИИ может предлагать sequence по сценам, например:
  - `scene-1: city`
  - `scene-2: mountains`
  - `scene-3: storm`
  - `scene-4: payoff`

Но сам пользователь также хочет иметь возможность задавать сцену как комбинацию слоев:

- `горы + облака + птицы + смена света`

Следовательно, новый UX должен поддержать оба уровня:

- scene-level пакет;
- scene-level набор library-backed слоев.

### 5. Как группировать world-элементы

Пользователь явно не хочет хаотичный набор мелких несвязанных вопросов.

Предпочтительный способ:

- группировать деревья, облака, погоду, время суток, `ground`, дальний фон и подобные элементы в раздел `Мир сцены`.

### 6. Как выбирать камеру

Пользователь не хочет выбирать сырые низкоуровневые оси `camera + timing` по отдельности.

Нужен выбор только по общему характеру движения камеры:

- классический боковой проход;
- прямой рельсовый фокус;
- `biography hold`;
- и подобные library-backed camera package.

### 7. Как выбирать hero

Пользователь предпочитает не абстрактное `objectFamily`, а максимально цельный выбор:

- сразу `hero package`, если для семейства уже есть жесткий baseline.

### 8. Что делать, если библиотека тему не покрывает

Пользователь уже выбрал режим:

- ИИ предлагает ближайший допустимый вариант;
- production-режим при этом остается только `Собрать ролик из библиотеки`.

### 9. Как должен выглядеть UX опросника

Пользователь хочет:

- нормальный полный опросник;
- с эмодзи для удобства чтения;
- таблицы допустимы;
- происхождение варианта по проектам должно быть видно;
- первая версия должна быть гибридной: не слишком узкой, но и не раздутой.

### 10. Отдельного `director pass` в новом workflow больше не будет

Пользователь отдельно уточнил важную вещь:

- в новом процессе не должно оставаться отдельного этапа вроде `director pass`;
- после выбора через конструктор `launch-card` уже считается финальной точкой проектного выбора;
- дальше идут только исполнение, machine-check и пользовательская проверка результата;
- задача workflow теперь не "сначала придумать и дорежиссировать", а "точно собрать из библиотеки и надежно проверить".

## Мое понимание целевого режима

### Короткая формула

Не `launch через creative exploration`, а:

`launch через library-backed конструктор -> launch-card как конфиг -> дальше только library-backed build`

### Главный продуктовый сдвиг

Сейчас процесс такой:

- сначала creative-направление;
- потом `launch-card`;
- потом `director pass`;
- потом `build-plan`.

Новый процесс должен стать таким:

- тема;
- быстрый library-only опросник;
- выбор `scene count`, `scene world`, `camera package`, `hero package`;
- сборка `launch-card` уже как project-config, а не как полу-творческий документ;
- сразу после `launch-card` идет execution-план и исполнение;
- дальше весь production идет только из выбранных baseline/preset/library-модулей;
- отдельного режиссерского этапа между `launch-card` и исполнением больше нет.

### Что по сути меняется

ИИ перестает:

- генерировать новые creative-направления по умолчанию;
- придумывать новый motion / reveal / environment на launch-этапе;
- выращивать новый production baseline прямо в ролике.

ИИ начинает:

- быть быстрым конфигуратором поверх реестра и библиотеки;
- показывать только допустимые варианты;
- рекомендовать лучший library-backed набор под тему;
- честно предлагать ближайший допустимый вариант, если точного покрытия нет;
- после `launch-card` сразу переходить к исполнению и проверкам, а не открывать еще один design-этап.

## Почему текущий workflow конфликтует с этой целью

Ниже не упрек текущему канону, а карта конкретных конфликтов.

### 1. Launch все еще creative-first

Текущий `concept-pack` по канону и skill-логике все еще предполагает:

- несколько вариантов героя;
- рекомендованный вариант;
- `adaptive review`;
- возможность `ai-custom`.

Это хорошо для exploratory-режима, но плохо для режима `быстрый сбор из библиотеки`.

### 2. В процессе еще живы выходы за пределы библиотеки

Даже после усиления `package-first` процесс все еще допускает:

- `ai-custom`;
- `user-custom`;
- `approved-custom`;
- `greenfield-approved`;
- `policy reuse: none`.

Это делает library-only режим нестрогим.

### 3. Пользовательский UX собран не вокруг конструктора

Сейчас библиотека описана достаточно хорошо для ИИ и для workflow-контрактов, но не собрана как простой user-facing каталог:

- что можно выбрать на уровень сцены;
- что можно выбрать на уровень камеры;
- что можно выбрать на уровень героя;
- как это комбинируется.

### 4. Библиотека описана по внутренним типам, а не по блокам выбора

Существующий реестр хорош как source-of-truth для:

- `camera preset`;
- `hero/object family`;
- `reveal/effect module`;
- `background / ambient / secondary-life system`.

Но пользователю нужен не такой интерфейс. Ему нужен конструктор по блокам:

- `Сцены`;
- `Мир сцены`;
- `Камера`;
- `Hero package`.

### 5. Не все нужные пользователю world-опции уже оформлены в библиотеке как first-class выбор

Из запросов пользователя видно желание выбирать не только то, что уже явно есть в registry, но и такие опции, как:

- силуэт города;
- птицы;
- самолет;
- управляемая смена времени суток / света как отдельный понятный выбор.

Сейчас не все эти сущности оформлены как registry-backed world modules или как user-facing constructor options.

## Что уже есть в библиотеке и на что реально можно опереться

### 1. Camera package

Сейчас в библиотечном слое уже есть как минимум такие scene-preset package:

- `soft-side-orbit-classic-v1`
- `rail-focus-vip-finale-v1`
- `biography-stele-focus-hold-v1`

Это хорошая база для блока `🎥 Характер движения камеры`.

### 2. Hero / object family

Сейчас подтверждены как минимум такие hero/object family:

- `tower-hologram-monolith-v1`
- `portrait-biography-stele-v1`
- `media-stele-shell-v1`
- `stone-altar-pedestal-v1`

Плюс есть reveal-базelines и вспомогательные presentation-модули.

Это хорошая база для блока `🏛 Hero package`, но UX-слой еще не собран.

### 3. World / environment слои

Сейчас в библиотеке уже есть useful building blocks:

- `horizon-mountain-ridge-v1`
- `forest-backdrop-v1`
- `birch-backdrop-v1`
- `low-poly-cloud-v1`
- `storm-effects-v1`
- `highway-ribbon-v1`
- `steam-train-line-v1`
- `corridor-relief-ground-v1`
- `wind-turbine-v1`

Это означает, что конструктор мира можно запускать уже не с нуля, а на реальном каталоге.

## Что пока не оформлено как готовый constructor-catalog

Ниже список не как bug-list, а как честная карта gaps.

### 1. Нет отдельного user-facing каталога конструктора

Сейчас source-of-truth разбросан между:

- `docs/library/ranking-corridor-module-registry.md`
- `src/lib/ranking-corridor/scene-presets/registry.ts`
- кодом library-модулей

Для пользователя это слишком низкоуровневый слой.

### 2. Нет scene-level world packages

Сейчас world-слой в основном собран как отдельные reusable модули и слоты, но не как готовые scene packages в духе:

- `Горный мир`
- `Городской силуэт`
- `Storm payoff`
- `Forest intro`

Пользователь же мыслит именно такими цельными сценами.

### 3. Нет полного покрытия желаемых world-элементов

По текущему audit видно:

- `горы` есть;
- `облака` есть;
- `лес / березы / деревья` есть;
- `шоссе с машинами` есть;
- `поезда` есть;
- `гроза` есть;
- `ground` есть.

Но при этом не вижу как first-class registry-backed вариантов:

- явный `city silhouette` / городской skyline;
- `birds`;
- `plane / airplane`;
- понятные отдельные user-facing пакеты `время суток / смена света`.

Часть подобной логики встречается в project-local окружениях, но это не равно готовой library-backed опции конструктора.

### 4. Hero package еще не собран как user-facing пакет верхнего уровня

Сейчас отдельные части hero живут в нескольких слоях:

- shell / hero family;
- reveal baseline;
- media policy;
- иногда topic-specific layout grammar.

Для конструктора нужно решить, что именно считать пользовательским атомом выбора:

- только shell family;
- family + reveal;
- family + reveal + media policy;
- family + reveal + camera recommendation.

Мое текущее мнение: для launch-конструктора правильнее дать именно `hero package`, а не абстрактные внутренние куски.

## Проверочный инвентарь: что реально есть в 4 проектных базах

Ниже блок написан намеренно простым человеческим языком.

Его цель:

- быстро увидеть, что у нас вообще уже есть как база для конструктора;
- понять, какие вещи уже стали библиотекой;
- понять, какие вещи пока остаются проектными и не могут считаться готовым reusable-слоем;
- дать пользователю место для правок и уточнений на ревью.

Под `4 проектными базами` здесь понимаются:

1. `ranking-towers` как legacy reference-проект
2. `most-visited-websites`
3. `strongest-pokemon`
4. `richest-women`

### 1. `ranking-towers`

Это старая базовая reference-композиция, из которой фактически вырос весь формат.

Что она нам уже дала как реальную библиотечную опору:

- классический боковой башенный проход камеры;
- голографическую башню-монолит как hero/object family;
- базовый reveal башни с hologram-dashboard;
- общее ощущение corridor-грамматики и башенного языка.

Что из нее уже можно считать реально переиспользуемым:

- `soft-side-orbit-classic-v1`
- `tower-hologram-monolith-v1`
- `tower-hologram-dashboard-reveal-v1`

Что она дает для конструктора в человеческом виде:

- режим камеры `классический башенный проход`;
- hero-направление `голографическая башня`;
- более техно-футуристический и "reference-like" язык башен.

Что пока не стоит считать чистым модулем верхнего уровня:

- вся старая композиция целиком;
- точная project-specific сборка `Tower` и `HologramDashboard`;
- полный old-style glue между камерой, героем и сценой.

Простым языком:

- это наш главный старый эталон башенного corridor-ролика;
- оттуда уже можно брать камеру и башню;
- но брать весь старый проект как готовую сцену-конструктор пока нельзя.

### 2. `most-visited-websites`

Это первый полноценный современный production-проект, который фактически поднял стартовую библиотеку.

Что этот проект дал библиотеке:

- rail-focus camera package для длинного corridor-прохода;
- projection-aware reveal/presentation gate;
- семейство reveal-эффектов dashboard-карточек;
- reusable media-stele shell;
- облака;
- ветряки;
- лесной задник;
- горный хребет;
- шоссе с машинами;
- storm effects;
- общий instancing helper для тяжелых 3D-массовок.

Что уже можно считать твердым reusable-слоем:

- `rail-focus-vip-finale-v1`
- `projection-presentation-gate-v1`
- `dashboard-card-reveal-effects-v1`
- `three-instanced-batches-v1`
- `media-stele-shell-v1`
- `low-poly-cloud-v1`
- `wind-turbine-v1`
- `forest-backdrop-v1`
- `horizon-mountain-ridge-v1`
- `highway-ribbon-v1`
- `storm-effects-v1`
- `image-pillar-dashboard-reveal-stack-v1`

Что этот проект дает для конструктора в человеческом виде:

- режим камеры `прямой рельсовый фокус`;
- hero-направление `медиа-стела / стела с экраном и dashboard-слоем`;
- мир типа `светлый цифровой сад`;
- scene vocabulary вроде:
  - лесной ранний мир;
  - далекие горы;
  - шоссе / поток машин;
  - storm-payoff;
  - облака и светлая атмосферная подача.

Что пока не является чистым модулем и остается проектным:

- полный hero сайтов целиком, где внутри уже живут конкретные поля `domain / visits / type / country`;
- вся режиссура `digital garden` как единый мир;
- конкретная драматургия clouds + sun + particles + finale payoff;
- website-specific dashboard grammar и dataset binding.

Простым языком:

- это проект, который больше всего дал в базовую библиотеку мира и камеры;
- но его полный "мир сайтов" пока не существует как одна готовая scene-package кнопка;
- есть набор модулей, из которых ее можно собрать.

### 3. `strongest-pokemon`

Это проект, который добавил в библиотеку сильный природный/fantasy-набор для мира и ground.

Что этот проект дал библиотеке:

- каменный алтарь-пьедестал;
- паровозную линию;
- corridor-relief ground.

Что уже можно считать твердым reusable-слоем:

- `stone-altar-pedestal-v1`
- `steam-train-line-v1`
- `corridor-relief-ground-v1`

Что этот проект дает для конструктора в человеческом виде:

- hero-направление `каменный алтарь / природный пьедестал`;
- directed-motion вариант `поезд`;
- живой эволюционирующий ground вместо плоской подложки;
- world-мотив `от леса к грозовой вершине`.

Какие scene-идеи в нем реально уже есть:

- ранний лесной акт;
- переходный более холодный горный акт;
- сумеречный storm-акт;
- финальный грозовой payoff.

Что пока не является чистым модулем и остается проектным:

- полная pokemon-specific интеграция сцены;
- общая 4-актная mountain-storm режиссура как цельный reusable package;
- image-first layout policy для этого типа героя;
- camera/world glue;
- dataset binding и конкретные pokemon-specific решения.

Простым языком:

- из этого проекта уже можно брать поезд, ground и каменный pedestal;
- но весь "покемонский мир" пока нельзя честно назвать готовой библиотечной сценой;
- это пока скорее сильный source project для природного scene-package будущего.

### 4. `richest-women`

Это проект, который сильнее всего развил biography/image-first hero family и отдельный camera behavior под него.

Что этот проект дал библиотеке:

- portrait-biography stele;
- biography hold / focus camera package;
- birch backdrop.

Что уже можно считать твердым reusable-слоем:

- `portrait-biography-stele-v1`
- `biography-stele-focus-hold-v1`
- `birch-backdrop-v1`

Что этот проект дает для конструктора в человеческом виде:

- hero-направление `портретная биографическая стела`;
- camera-направление `фокус с долгим hold для чтения`;
- nature-side backdrop в духе `березовый пояс`;
- grammar, где крупный portrait, biography-card и pedestal работают как единый hero package.

Что пока не является чистым модулем и остается проектным:

- полная corridor-сборка проекта как готовый reusable world-package;
- dataset binding, wealth normalization и country-to-flag normalization;
- тяжелый biography overlay и его project-specific glue;
- точная orchestration окружения вокруг biography hero;
- комбинация birch + storm/cloud/sun как готовая scene package.

Простым языком:

- из этого проекта уже можно брать biography hero и соответствующую камеру;
- но цельный `richest-women world` как готовая сцена-конструктор еще не оформлен.

## Быстрый список: что уже можно реально переиспользовать по-человечески

Ниже список без внутренних подробностей, просто как проверочный инвентарь для ревью.

### Камеры

- Классический башенный проход
- Прямой рельсовый фокус
- Фокус с долгим biography-hold

### Hero / башни / пьедесталы

- Голографическая башня-монолит
- Портретная биографическая стела
- Media-stele shell как база для image/dashboard героя
- Каменный алтарь-пьедестал

### Появление hero

- Появление башни с голографическим dashboard
- Появление стелы с dashboard-слоем
- Projection-aware presentation gate

### Мир / фон / вторичная жизнь

- Горный хребет на горизонте
- Лесной задник
- Березовый backdrop
- Низкополигональные облака
- Грозовые эффекты
- Шоссе с машинами
- Паровозная линия
- Ветряные турбины
- Рельефный corridor-ground

## Что уже похоже на scene vocabulary, но еще не оформлено как готовые scene package

Ниже важная промежуточная зона.

Это не пустота и не отсутствие контента. Это элементы, которые уже есть в проектах, но пока не собраны в чистую library-backed сцену-кнопку.

### Уже можно собрать руками из существующей библиотеки

- лесная ранняя сцена;
- горная сцена;
- storm-сцена;
- highway/mobility сцена;
- nature-сцена с березами;
- техно-башенная сцена вокруг `ranking-towers`-baseline;
- media-stele сцена в духе websites.

### Пока еще не оформлено как чистый reusable package верхнего уровня

- `digital garden` как готовый сценический пакет;
- `forest -> mountain -> storm -> payoff` как готовый сценический пакет;
- `biography corridor world` как готовый сценический пакет;
- `classic ranking-towers world` как scene package с machine-readable контрактом.

## Что пока явно отсутствует или недостаточно оформлено для конструктора

Ниже список вещей, которые пользователь уже хочет видеть в будущем конструкторе, но которые я пока не могу честно назвать готовыми first-class library options.

### Похоже, отсутствует как чистый library-backed вариант

- `city silhouette` / городской skyline;
- `birds`;
- `plane / airplane`.

### Похоже, существует частично, но не оформлено как чистая user-facing опция

- `смена времени суток`;
- `смена света`;
- `солнце / закат / day-night transition` как самостоятельный scene control;
- готовые scene package, а не только world-slot модули.

## Мой текущий вывод по этому инвентарю

Если смотреть человеческим языком, библиотека уже достаточно богата для первого конструктора, но не для "идеального полного меню".

Что уже можно честно предлагать в первом релизе конструктора:

- 3 сильных camera package;
- несколько hero-направлений;
- базовые world-слои для природы, грозы, машин, поездов, облаков, ground;
- ближайшие рекомендованные комбинации по проектам-источникам.

Что еще придется либо добавить в библиотеку, либо честно считать отсутствующим:

- городской силуэт;
- птицы;
- самолет;
- верхнеуровневые scene package;
- отдельные first-class controls для времени суток и световой драматургии.

## Новый важный вывод: нам не хватает не только модулей, но и reuse на уровне целого проекта

Из нового запроса пользователя видно еще один важный сценарий:

- не только `собери ролик из модулей`;
- но и `возьми существующий проект как базу, скопируй его и адаптируй под новую тему`.

Это означает, что одного только module-level reuse нам недостаточно.

Нужен еще один слой переиспользования:

- `source project template`

Простым языком:

- иногда пользователю нужен не выбор из 20 мелких деталей;
- иногда ему нужно сказать: `хочу ролик типа сайтов`, `хочу ролик типа покемонов`, `хочу ролик типа богатых женщин`;
- дальше ИИ берет соответствующую базу и меняет данные, ассеты и тему, но не изобретает заново архитектуру сцены.

## Какие уровни reuse нам вообще нужны

Чтобы не смешивать все в одну кучу, предлагаю мыслить так.

### 1. `library module`

Это маленький или средний чистый reusable-элемент:

- камера;
- reveal;
- shell;
- clouds;
- storm;
- train;
- ground;
- и так далее.

### 2. `package / preset`

Это уже не один модуль, а готовая связка:

- camera package;
- hero package;
- scene package.

### 3. `source project template`

Это самый важный новый слой для быстрого продакшна.

Это не "чистый модуль", а готовая база проекта, у которой уже согласованы:

- composition structure;
- scene-logic;
- camera behavior;
- hero grammar;
- world orchestration;
- тип данных;
- характер ассетов.

Такой template можно:

- копировать;
- переименовывать;
- подменять dataset;
- подменять ассеты;
- адаптировать тему;
- не ломая базовый production skeleton.

### 4. `project-local`

Это то, что по-хорошему не надо тащить вверх:

- одноразовые спецэффекты;
- слишком узкая тема;
- glue-код, который полезен только в одном ролике;
- временные решения.

## Что это меняет practically

Для быстрого производства нам выгодно развивать два типа библиотеки одновременно:

1. библиотеку модулей;
2. библиотеку project templates.

Именно второй тип закроет запрос пользователя:

- `возьми проект как основу и адаптируй`.

## Какие project templates уже напрашиваются

Ниже мой текущий анализ по 4 базам.

### 1. Template на базе `ranking-towers`

Это хороший кандидат на template типа:

- `classic-tower-template`

Для каких тем подходит:

- техно;
- абстрактный рейтинг;
- темы, где уместен более "reference-like" corridor с башнями;
- случаи, где нужен классический башенный визуальный язык без biography-логики и без image-first media-stele.

Что в таком template должно быть зафиксировано:

- классическая башенная композиция;
- `soft-side-orbit` камера;
- hologram tower baseline;
- базовый reveal башни;
- corridor grammar reference-уровня.

Что можно менять при адаптации:

- dataset;
- подписи;
- метрики;
- материалы;
- палитру;
- часть world-окружения.

Что не нужно каждый раз переписывать:

- базовый camera path;
- башенный shell;
- reveal grammar;
- layout базовых tower-state зон.

Вывод:

- это отличный кандидат не только на module-source, но и на `legacy template`.

### 2. Template на базе `most-visited-websites`

Это, возможно, самый сильный кандидат на reusable project template.

Рабочее имя:

- `media-stele-corridor-template`

Для каких тем подходит:

- сайты;
- бренды;
- приложения;
- платформы;
- компании;
- любые image/logo-heavy datasets;
- любые темы, где герой — это медиа-стела с dashboard-данными.

Что в нем уже ценно как template:

- rail-focus corridor skeleton;
- image/dashboard hero logic;
- projection-aware presentation;
- сильный production-ready 4-scene feel;
- world-мир, который можно относительно легко theme-adapt без полной пересборки.

Что можно безопасно подменять:

- dataset;
- логотипы / изображения;
- типы метрик;
- флаги;
- тон мира;
- состав world layers;
- palette и secondary-life tone.

Что стоит дополнительно поднять из project-local в reusable package/template слой:

- полный `media-stele hero package`, а не только shell + reveal fragments;
- `digital-garden` scene package как готовый world-sequence;
- website-like data adapter для логотипов, country, rank, main metric и secondary badge;
- theme-level intro / hook package.

Вывод:

- это лучший кандидат на первый настоящий `clone-and-adapt` template.

### 3. Template на базе `strongest-pokemon`

Рабочее имя:

- `nature-altar-corridor-template`

Для каких тем подходит:

- игры;
- персонажи;
- существа;
- fantasy / mythology;
- military / power ranking;
- темы, где нужен природный, монументальный или altar-like hero.

Что в нем уже ценно:

- strong 4-act world progression;
- природный / fantasy world direction;
- `stone-altar` base;
- `train` и `relief-ground` как живой world backbone;
- хорошая сцепка image-first hero с nature/storm escalation.

Что можно безопасно подменять:

- dataset;
- портреты / artwork;
- типы бейджей и вторичных метрик;
- palette мира;
- degree of storm / forest / mountains;
- directed-motion pacing.

Что стоит дополнительно вынести в reusable слой:

- `mountain-storm 4-scene package`;
- `image-first adaptive-safe media policy` как явный reusable policy layer;
- altar-hero package верхнего уровня, а не только pedestal shell;
- train-route presets или scene-level train choreography presets.

Вывод:

- это очень сильный кандидат на template для всех nature/fantasy/power тем.

### 4. Template на базе `richest-women`

Рабочее имя:

- `portrait-biography-corridor-template`

Для каких тем подходит:

- исторические личности;
- предприниматели;
- политики;
- ученые;
- актеры;
- любые biography-heavy рейтинги, где нужен крупный portrait и длинный текстовый контекст.

Что в нем уже ценно:

- biography stele;
- biography camera hold;
- длинный читабельный text-first hold;
- right-side biography card;
- hero grammar под portrait + fact + money/source detail.

Что можно безопасно подменять:

- dataset;
- portrait assets;
- flag data;
- конкретные поля biography-card;
- world mood;
- pacing в рамках согласованного biography-style.

Что стоит дополнительно вынести в reusable слой:

- полный `portrait-biography hero package`, включая overlay/presentation glue;
- biography dataset adapter;
- full corridor biography template, а не только single-hero / hero-family baseline;
- biography world package или хотя бы biography-friendly scene sequence presets.

Вывод:

- это не просто набор модулей, а почти готовый template для всех biography-рейтингов.

## Что именно стоит добавить в библиотеку ради быстрого сборочного режима

Ниже уже не просто инвентарь, а мой приоритетный список кандидатов на promotion.

### A. Добавить `project templates`

Это главный новый тип reuse, которого сейчас не хватает.

Я бы завел как минимум такие template-классы:

- `classic-tower-template` на базе `ranking-towers`
- `media-stele-corridor-template` на базе `most-visited-websites`
- `nature-altar-corridor-template` на базе `strongest-pokemon`
- `portrait-biography-corridor-template` на базе `richest-women`

Это даст быстрый режим:

- `Выбери базовый проект`
- `Замени данные`
- `Замени ассеты`
- `Подстрой тему`

### B. Добавить `scene packages`

Сейчас у нас много world-slot модулей, но мало scene-level пакетов.

Для ускорения сборки полезно поднять такие готовые сценические наборы:

- `digital-garden-sequence`
- `forest-to-storm-sequence`
- `biography-nature-sequence`
- `classic-tech-tower-sequence`

Они должны быть не обязательно жестко фиксированными, а как reusable scene skeleton.

### C. Добавить `hero packages` верхнего уровня

Сейчас часть hero уже есть как family и reveal, но для быстрого продакшна полезно иметь более цельный атом выбора:

- full media-stele hero package;
- full altar image-first hero package;
- full portrait-biography hero package;
- classic tower hero package.

Пользовательский смысл:

- не собирать героя каждый раз из shell + reveal + layout policy + media policy вручную.

### D. Добавить `data adapters`

Для быстрого копирования проекта под новую тему нужен не только визуальный слой, но и data layer.

Особенно полезны такие reusable adapters:

- generic ranking dataset adapter;
- logo/image-first adapter;
- portrait-biography adapter;
- country-to-flag normalization adapter;
- metric formatting packs;
- optional badge/category adapters.

Иначе copy-template будет все равно каждый раз упираться в ручную перепайку данных.

### E. Добавить `policy layers`

Сейчас некоторые сильные решения уже видны, но еще не оформлены как reusable policy:

- `image-first adaptive-safe media policy`
- `biography side-card readability policy`
- `rank placement policy`
- `protected data-zone policy`
- `lane collision policy`

Это ускорит адаптацию проекта без переписывания layout с нуля.

### F. Добавить `theme/world orchestration presets`

Это слой между чистым world-модулем и полным project template.

Примеры того, что стоит оформить:

- progression preset `forest -> mountain -> storm`
- progression preset `light garden -> highway -> storm payoff`
- progression preset `calm birch -> dramatic hold-tail`
- light/time-of-day progression preset

## Что именно из текущего project-local особенно стоит поднять вверх

Ниже мой shortlist, если смотреть прагматично.

### Из `most-visited-websites`

- `media-stele hero package`
- `digital garden world sequence`
- website/image-first project template

### Из `strongest-pokemon`

- `image-first adaptive-safe media policy`
- `nature-altar project template`
- `forest-to-storm scene sequence`

### Из `richest-women`

- biography dataset adapter
- full biography corridor template
- biography overlay / presentation package как более цельный reusable слой

### Из `ranking-towers`

- classic tower project template
- classic tower scene/world package

## Что не нужно пытаться сделать чистым модулем

Важно не перетащить в библиотеку все подряд.

Некоторые вещи полезнее держать как `template-level reuse`, а не как атомарный модуль:

- полная режиссура 4-актовой эскалации;
- конкретный composition skeleton;
- project-specific glue между camera, hero и world;
- onboarding-конфиг проекта;
- mapping от dataset к visual slots.

То есть часть решений надо поднимать не в `src/lib/...`, а в слой:

- `project template`
- `scene package`
- `data adapter`

## Как я вижу будущий режим "возьми проект и адаптируй"

Это должен быть отдельный, но library-safe сценарий внутри конструктора.

Примерно так:

1. Пользователь говорит:
   - `возьми проект типа сайтов`
   - или `хочу базу как у покемонов`
2. ИИ предлагает 2-4 доступных `source project template`.
3. Пользователь выбирает template.
4. ИИ спрашивает только то, что действительно меняется:
   - новые данные;
   - тип ассетов;
   - какие сцены сохранить, какие заменить;
   - насколько менять мир;
   - сохраняем ли камеру и hero grammar.
5. Дальше ИИ:
   - копирует project skeleton;
   - подменяет dataset/asset adapters;
   - оставляет baseline-поведение;
   - делает theme adaptation в разрешенных границах.

## Почему это может быть даже важнее мелкого конструктора

Если честно, для скорости production `source project template` может оказаться полезнее, чем слишком детальный конструктор.

Потому что:

- пользователь часто уже знает, какой проект ему нравится как база;
- копирование хорошего skeleton быстрее, чем ручной выбор 15 опций;
- quality bar стабильнее, когда reuse-ится не только модуль, но и вся проектная композиция.

Следовательно, в будущем логично иметь два user-facing режима на одном library-only фундаменте:

1. `Собрать ролик из блоков`
2. `Взять готовый базовый проект и адаптировать`

Но оба режима должны оставаться library-safe и не уезжать в скрытый greenfield.

## Что даст самый быстрый выигрыш по скорости

Если смотреть не на "идеальную библиотеку", а именно на ускорение старта новых роликов, я бы приоритизировал так.

### Приоритет 1. `source project templates`

Это главный ускоритель.

Если пользователь уже может сказать:

- `хочу базу как у сайтов`
- `хочу базу как у покемонов`
- `хочу базу как у богатых женщин`

то ИИ не нужно собирать ролик заново по атомам. Он берет проверенный skeleton и делает только controlled adaptation.

Именно это быстрее всего снижает:

- число ошибок;
- число лишних вопросов;
- число новых неустойчивых решений.

### Приоритет 2. Полные `hero packages`

Следующий по ценности слой:

- full `media-stele`
- full `altar image-first`
- full `portrait-biography`
- full `classic tower`

Пока герой собирается из shell + reveal + policy + adapter, старт остается слишком "ручным".

### Приоритет 3. `data adapters`

Если нет хороших adapters, то даже хороший template все равно начинает разваливаться на ручной glue-код.

Особенно важны:

- generic ranking adapter;
- image/logo-first adapter;
- portrait-biography adapter;
- flag/country normalization;
- metric formatting packs.

### Приоритет 4. `scene/world packages`

После templates и hero packages уже имеет смысл поднимать готовые scene-sequence:

- `digital-garden`
- `forest-to-storm`
- `biography-friendly hold sequence`
- `classic tower tech sequence`

Это полезно и для конструктора, и для clone-and-adapt режима.

### Приоритет 5. `policy layers`

Это уже не первый шаг, но хороший ускоритель второй волны:

- safe media fit;
- protected data zone;
- readable biography sidebar;
- rank placement;
- lane collision / spacing.

Эти вещи сильно уменьшают количество мелких правок при адаптации базового проекта.

## Практический вывод для ревью

Если нам нужно быстро получить рабочий production-flow, я бы обсуждал не абстрактное "что еще модульнуть", а такой порядок:

1. сначала library-safe `project templates`;
2. затем полные `hero packages`;
3. затем `data adapters`;
4. затем scene/world packages;
5. и только потом уже расширение мелких world-атомов вроде птиц, самолета и дополнительных city-слоев.

То есть мой текущий вывод такой:

- для скорости важнее `reuse whole project skeleton`, чем бесконечно дробить библиотеку на маленькие детали;
- конструктор из блоков нужен;
- но режим `возьми проект и адаптируй` почти наверняка даст более быстрый production ROI уже в первой версии.

## Рекомендуемая модель конструктора

Ниже моя предпочтительная модель, которую стоит принести на ревью.

### Блок 1. `🎬 Структура ролика`

Пользователь выбирает:

- число больших визуальных сцен;
- по умолчанию `4`.

Важно:

- это не технические `scene-1..4` из build-plan как таковые;
- это product-level число world-актов ролика;
- потом оно уже маппится на machine-readable scene ids.

### Блок 2. `🌍 Мир сцены`

Для каждой сцены нужен один компактный блок с world-слоями.

Предпочтительная внутренняя структура:

- `Дальний фон` (`horizon`)
- `Боковое окружение` (`side-dressing`)
- `Направленное движение` (`directed-motion`)
- `Атмосфера и погода` (`atmospheric-motion | light-weather | payoff`)
- `Поверхность / ground`
- `Свет / время суток`

Важная мысль:

- пользователь не обязан знать эти внутренние ids;
- но конструктор внутри должен быть собран именно на этих слотах.

### Блок 3. `🎥 Камера`

Пользователь видит только общий характер движения, например:

- `Классический башенный проход`
- `Прямой рельсовый фокус`
- `Фокус с hold-паузой`

Дополнительно ИИ должен:

- показать из каких проектов пришел пакет;
- отметить наиболее подходящий для текущей темы;
- не раскладывать это обратно на сырые `camera + timing`.

### Блок 4. `🏛 Hero package`

Пользователь должен выбирать не сырые `objectFamily` и не отдельно reveal.

Рекомендуемая подача:

- человекочитаемое имя;
- откуда пакет пришел;
- для каких тем обычно подходит;
- краткая логика hero-модуля;
- статус `жесткий baseline` или более мягкий reusable вариант.

### Блок 5. `📦 Сводка конфигурации`

После ответов ИИ должен собрать:

- рекомендуемый library-only набор;
- альтернативу, если она есть;
- итоговую сводку в machine-readable виде для будущего `launch-card`.

Это и должно заменить нынешний creative-first `concept-pack`.

## Как должен вести себя ИИ в новом режиме

### Базовое правило

Если тема неплохо покрывается библиотекой:

- ИИ не придумывает новый вариант;
- ИИ рекомендует лучший library-backed набор.

### Если точного покрытия нет

С учетом ответа пользователя:

- ИИ не уходит в `ai-custom`;
- ИИ предлагает ближайший допустимый вариант из библиотеки;
- ИИ честно помечает, где компромисс.

### Что нужно убрать из production-потока

В режиме `Собрать ролик из библиотеки` нужно считать недопустимыми:

- `ai-custom`
- `user-custom`
- `approved-custom`
- `greenfield-approved`
- `policy reuse: none` для ключевых launch/build решений

Исключение возможно только в отдельном контуре развития библиотеки, но не в production-конструкторе.

## Что предлагаю считать инвариантами нового режима

- только один production-mode: `Собрать ролик из библиотеки`;
- launch не creative-first, а constructor-first;
- `launch-card` становится конфигом выбранных library-backed пакетов;
- `launch-card` становится последней обязательной точкой выбора до исполнения;
- отдельного `director pass` в новом режиме нет;
- `build-plan` в этом режиме не имеет права уходить в greenfield;
- если покрытия нет, ИИ предлагает ближайший допустимый вариант, а не новый custom;
- расширение библиотеки должно быть отдельной задачей, а не скрытым продолжением production.

## Какие документы и слои придется менять

### 1. Канон workflow

Скорее всего потребуются изменения в:

- `docs/canon/ranking-corridor-working-mode.md`

Что именно:

- убрать creative-first дефолт для launch;
- зафиксировать constructor-first режим как дефолт;
- переписать launch как опросник по library-backed блокам;
- запретить custom/greenfield внутри production-контура;
- развести `production` и `library-development` хотя бы концептуально, даже если пользовательский режим останется один.

### 2. Launch skill

Скорее всего придется существенно переделывать:

- `.agents/skills/ranking-corridor-launch/SKILL.md`

Сдвиг такой:

- из генератора `concept-pack` в orchestrator конструктора;
- вместо 4 creative-вариантов герой/камера/ритм — структурированный опросник по библиотеке;
- с рекомендацией под тему и происхождением по проектам.

### 3. Шаблон `launch-card`

Потребуется переделать:

- `docs/templates/ranking-corridor-launch-card-template.md`

Скорее всего туда нужно добавить или заменить поля в сторону:

- `sceneCount`
- `sceneSequence`
- `sceneWorldConfig`
- `cameraPackage`
- `heroPackage`
- `libraryOnlyMode: true`

И убрать нормализацию под custom-ветки, если это production-конструктор.

### 4. `build-plan` и validator

Потребуются изменения в:

- `docs/templates/ranking-corridor-build-plan-template.md`
- `scripts/validate-ranking-build-plan.ts`

Что именно:

- если проект запущен как `library-only`, key preview task не могут иметь `greenfield-approved`;
- `Reference baseline` должен быть library-backed и точным;
- environment должен строиться только из допустимых registered world-slot решений или из заранее оформленных scene packages.

### 5. Реестр библиотеки

Изменения понадобятся в:

- `docs/library/ranking-corridor-module-registry.md`

Не только как добавление модулей, но и как улучшение user-facing metadata.

Текущая мысль:

- реестр уже хороший source-of-truth для машины;
- для конструктора, вероятно, нужен либо расширенный metadata-слой внутри registry, либо отдельный constructor-catalog поверх registry.

### 6. Новый промежуточный слой каталога

С высокой вероятностью нужен новый документ или набор документов, которые превратят library registry в простой каталог конструктора.

Например, отдельный слой вида:

- `docs/library/ranking-corridor-constructor-catalog.md`

или набор файлов по категориям:

- camera catalog
- hero catalog
- world catalog
- scene package catalog

Пока это только рабочая мысль, не решение.

## Что нужно будет сделать после ревью, помимо идеи

Пользователь отдельно зафиксировал важную вещь:

- мало придумать новый режим;
- нужно реально исправить workflow;
- заранее спланировать внедрение;
- проверить, что новый workflow действительно работает;
- и актуализировать всю связанную документацию.

То есть задача не в стиле `описали желаемое состояние и забыли`.

Нужен полноценный migration-pass.

## Контур внедрения после ревью

Ниже мой практический порядок, если после ревью мы идем в реализацию.

### Шаг 1. Зафиксировать новый product-contract

Сначала нужно утвердить на ревью:

- оба user-facing режима:
  - `собрать из блоков`
  - `взять базовый проект и адаптировать`
- что именно считается `library-safe`;
- какие custom-ветки окончательно запрещаются в production;
- какие поля становятся обязательными в `launch-card`.

Без этого нельзя надежно переписывать skill и validator.

### Шаг 2. Исправить launch workflow

Нужно переделать старт нового ролика так, чтобы:

- дефолтный вход больше не запускал creative-first `concept-pack`;
- вместо этого запускался constructor-first опросник;
- опросник умел работать и как `block constructor`, и как `template selector`.

Именно здесь должен появиться новый UX:

- тема;
- выбор scene/world;
- выбор камеры;
- выбор hero package;
- либо выбор `source project template`.

### Шаг 3. Исправить файловые артефакты workflow

После переделки launch сам файловый workflow тоже должен стать другим:

- `launch-card` должен фиксировать library-only выбор явно;
- `launch-card` должен сразу быть достаточным входом для build/execution-фазы без дополнительного `director pass`;
- `build-plan` должен наследовать этот режим и не позволять hidden greenfield;
- `review-notes` и последующий production-flow не должны ломать выбранный baseline молча.

### Шаг 4. Усилить machine-check

Новый режим нельзя оставлять только как договоренность в тексте.

Нужно, чтобы validator и связанные проверки:

- распознавали `library-only / constructor` режим;
- падали на `greenfield-approved`, если проект library-only;
- падали на несогласованные `custom` ветки;
- проверяли, что `launch-card` и `build-plan` действительно опираются на registry/template/catalog source-of-truth.

### Шаг 5. Прогнать workflow end-to-end

После изменения канона и skill нельзя считать задачу завершенной без прогонов реального сценария.

Нужно прогнать как минимум:

- новый старт ролика из блоков;
- новый старт ролика из базового project template;
- продолжение проекта после `launch-card`;
- переход в `build-plan`;
- сценарий с темой, которая покрывается только частично.

### Шаг 6. Актуализировать документацию одним пакетом

После того как логика реально заработает, нужно в том же change-set синхронно обновить всю навигацию и документы, а не оставлять это на потом.

Иначе репозиторий снова начнет расходиться между:

- тем, как workflow реально работает;
- тем, что написано в каноне;
- тем, что подсказывает skill;
- тем, что читает пользователь в документации.

## Как проверять, что новый workflow реально работает

Ниже мой минимальный пакет проверок, который я бы считал обязательным перед тем, как говорить "режим внедрен".

### 1. Chat-first smoke test для нового запуска

Проверить руками или scripted-probe сценарий:

- пользователь пишет: `Новый ролик на тему ...`
- ИИ больше не уходит в старый `concept-pack`;
- ИИ запускает constructor-first опросник;
- на выбор предлагает только library-backed или template-backed варианты.

### 2. Smoke test для режима `возьми проект и адаптируй`

Проверить сценарий вида:

- `Хочу ролик как про сайты, но про бренды`
- `Хочу базу как у покемонов, но под другую тему`

Ожидаемое поведение:

- ИИ предлагает доступные `source project template`;
- после выбора спрашивает только адаптационные вопросы;
- не пересобирает базовый skeleton с нуля.

### 3. Negative test на непокрытую тему

Проверить сценарий, где тема не покрывается библиотекой идеально.

Ожидаемое поведение:

- ИИ не генерирует скрытый `ai-custom`;
- ИИ предлагает ближайший допустимый вариант;
- честно помечает компромисс.

### 4. File artifact test

Проверить, что после запуска:

- `launch-card` создается в нужной форме;
- режим `library-only / constructor / template-based` явно отражен в файле;
- все ключевые выбранные пакеты и world-конфиг сохраняются воспроизводимо.

### 5. Validator test

Проверить, что:

- корректный `launch-card` + `build-plan` проходят;
- `greenfield-approved` в library-only проекте не проходит;
- `approved-custom` и аналогичные обходы не проходят там, где они запрещены;
- ссылки на package/template/catalog source-of-truth валидируются.

### 6. Production continuation test

Проверить, что после уже созданного `launch-card` production-этап:

- не возвращается в creative exploration;
- не требует отдельного `director pass`, чтобы начать исполнение;
- не ломает выбранный hero/camera/world baseline;
- корректно продолжает проект через `build-plan`, исполнение и проверки.

### 7. Regression test на старые базовые темы

Нужно прогнать хотя бы 4 эталонных сценария:

- тема типа `ranking-towers`
- тема типа `most-visited-websites`
- тема типа `strongest-pokemon`
- тема типа `richest-women`

Цель:

- убедиться, что новый workflow не делает старт хуже там, где библиотека уже сильная.

## Какие документы нужно будет актуализировать обязательно

Ниже список не "можно бы обновить", а того, что почти наверняка придется синхронно править.

### Канон и карта документации

- `docs/README.md`
- `docs/canon/ranking-corridor-working-mode.md`
- при необходимости `docs/canon/ranking-corridor-format.md`
- при необходимости `projects/README.md`

### Шаблоны project-артефактов

- `docs/templates/ranking-corridor-launch-card-template.md`
- `docs/templates/ranking-corridor-build-plan-template.md`

### User-facing библиотечный слой

- `docs/library/ranking-corridor-module-registry.md`
- возможно новый `constructor-catalog`
- возможно отдельный template-catalog

### Skills

- `.agents/skills/ranking-corridor-launch/SKILL.md`
- `.agents/skills/ranking-corridor-production/SKILL.md`

Если production skill в тексте или в ожиданиях еще опирается на старый creative-first launch, его тоже придется синхронизировать.

### Machine-check и guardrails

- `scripts/validate-ranking-build-plan.ts`
- при необходимости связанные validators / checks, если они читают `launch-card` или опираются на старую грамматику режима

## Что считать готовностью migration

Я бы не считал задачу завершенной, пока не выполнены все пункты ниже.

1. Новый launch действительно работает как constructor-first.
2. Режим `возьми проект и адаптируй` реально поддержан хотя бы на уровне 2-4 template-баз.
3. `launch-card` и `build-plan` отражают новый режим явно и воспроизводимо.
4. После `launch-card` проект может сразу перейти к исполнению без отдельного design-этапа.
5. Validator не дает library-only проекту незаметно уйти в custom/greenfield.
6. Канон, skills, шаблоны и навигационная документация не противоречат друг другу.
7. Пройдены smoke/regression-прогоны на реальных темах.

## Моя рекомендация по внедрению

Не пытаться сразу идеально переделать весь workflow.

Правильнее идти в 3 волны.

### Волна 1. Зафиксировать product-contract нового режима

Цель:

- договориться, что именно считается `library-only constructor`.

Результат:

- ревью этого документа;
- окончательное решение по UX блокам;
- решение, нужен ли отдельный constructor-catalog файл.

### Волна 2. Собрать минимально рабочий constructor-catalog

Цель:

- быстро перевести существующую библиотеку в user-facing список выбора.

На этом этапе не обязательно сразу закрывать все мечты пользователя по миру сцены. Достаточно:

- камер;
- hero packages;
- базовых world-слоев;
- scene-level sequence для 4-сценного ролика.

### Волна 3. Ужесточить канон и validator

Цель:

- сделать так, чтобы production реально не мог уйти обратно в creative-first и greenfield.

Именно на этой волне имеет смысл:

- вырезать `ai-custom` из production-контура;
- запретить `greenfield-approved` в `library-only` режиме;
- пересобрать `launch-card` и `build-plan`.

## Самый практичный MVP

Если нужен не идеальный, а быстрый MVP, я бы делал так.

### MVP scope

- оставить один launch skill, но переписать его в constructor-first режим;
- не изобретать пока новый большой catalog system, а собрать первую версию каталога из текущего registry;
- дать пользователю выбор по 4 главным блокам:
  - сцены;
  - мир сцены;
  - камера;
  - hero package;
- явно помечать gaps и предлагать ближайший допустимый вариант;
- не трогать пока library growth policy целиком, но production-конструктор уже сделать strict.

### Почему это хороший MVP

- быстро даст пользователю желаемый UX;
- не потребует сразу полной миграции всех слоев библиотеки;
- покажет реальные пробелы покрытия;
- сократит время старта ролика уже на первой итерации.

## Риски и спорные места

### 1. Библиотека еще не покрывает весь желаемый vocabulary пользователя

Главный риск:

- пользователь ожидает выбрать `city silhouette`, `birds`, `plane`, `time-of-day` как полноценные first-class опции, а библиотека пока не везде готова.

Следствие:

- конструктор нельзя притворно делать шире, чем реальное покрытие.

### 2. Слишком строгий library-only режим может оказаться слишком узким

Если сейчас резко запретить все custom/greenfield:

- старт станет быстрее;
- но часть тем будет forced-fit в неидеальные baseline.

С учетом ответа пользователя это допустимо, но это нужно честно удерживать как осознанный компромисс.

### 3. Hero package может оказаться слишком крупной единицей выбора

Если пакет будет слишком жестким:

- старт упростится;
- но число полезных комбинаций снизится.

Если пакет будет слишком мелким:

- вернемся к сложному launch.

Это одна из ключевых точек будущего ревью.

### 4. Scene package vs scene slots

Пользователь хочет одновременно:

- scene sequence;
- и возможность задать сцену как комбинацию `горы + облака + птицы + смена света`.

Следовательно, конструктор не должен быть только package-only. Нужен гибрид:

- scene-level готовый шаблон;
- или ручная сборка сцены из library-backed слотов.

### 5. Придется решить, где именно хранить user-facing названия и рекомендации

Варианты:

- прямо в registry;
- в отдельном constructor-catalog;
- частично в skill, частично в docs.

Мое текущее мнение: лучше не перегружать существующий registry всей пользовательской логикой и завести над ним отдельный catalog layer.

## Предварительные открытые вопросы для будущего ревью

Ниже вопросы, которые я считаю еще не закрытыми на 100%.

1. Нужен ли отдельный файл-каталог конструктора поверх registry или достаточно расширить текущий registry?
2. Что именно считать пользовательским `hero package`: только family, family + reveal или более крупный bundle?
3. Хотим ли мы разрешать scene-level ручную сборку только из существующих world-slot модулей с первого релиза, или сначала показывать пользователю только готовые scene packages?
4. Нужно ли в первой версии позволять разное число сцен кроме `4`, или пока лучше держать `4` как default и strongest path?
5. Нужен ли внутри `launch-card` явный флаг режима вроде `Workflow mode: library-only-constructor`?

## Предварительный план внедрения

### Этап 1. Зафиксировать целевой UX конструктора

- Утвердить блоки опросника.
- Утвердить модель сцен как больших `world-act`.
- Утвердить модель мира сцены как grouped `world slots`.
- Утвердить подачу камеры и hero package.

### Этап 2. Собрать карту текущего library coverage под конструктор

- Сопоставить текущие модули из registry с user-facing блоками выбора.
- Явно зафиксировать gaps:
  - `city silhouette`
  - `birds`
  - `plane`
  - `time-of-day / light-change` как first-class варианты
- Решить, какие gaps блокируют MVP, а какие можно закрывать позже через nearest allowed fallback.

### Этап 3. Добавить user-facing constructor-catalog

- Либо как новый документ в `docs/library/`;
- либо как расширение registry плюс тонкий catalog-view.

Каталог должен уметь отвечать на вопросы:

- что можно выбрать;
- из каких проектов это пришло;
- для каких тем это обычно подходит;
- какие комбинации совместимы.

### Этап 4. Переписать launch-этап в constructor-first режим

- Переделать launch skill.
- Убрать creative-first `concept-pack` как дефолт.
- Включить полноценный опросник с эмодзи и таблицами.
- Оставить только library-backed варианты и nearest allowed fallback.

### Этап 5. Пересобрать `launch-card`

- Сделать его конфигом конструктора.
- Зафиксировать sequence сцен, camera package, hero package и world config.
- Убрать или деактивировать custom-ветки для production-контура.

### Этап 6. Ужесточить `build-plan` и validator

- Для `library-only` launch запретить `greenfield-approved`.
- Убрать возможность custom baseline для ключевых preview task.
- Проверять, что environment, camera и hero действительно собраны из library-backed source-of-truth.

### Этап 7. Прогнать на реальных темах

Минимальный набор сценариев для ревью:

- тема в стиле `most-visited-websites`;
- тема в стиле `richest-women`;
- тема в стиле `strongest-pokemon`;
- тема, которую библиотека покрывает только частично.

Цель:

- проверить, что новый UX действительно быстрее;
- проверить, что nearest allowed fallback не выглядит как скрытый greenfield;
- понять, где библиотеку нужно расширять уже отдельными задачами.

## Личная рекомендация перед следующим ревью

На следующем ревью я бы обсуждал не весь пласт разом, а в таком порядке:

1. согласовать product-contract конструктора;
2. согласовать структуру блока `Мир сцены`;
3. решить судьбу отдельного constructor-catalog;
4. только потом менять канон, skill, шаблоны и validator.

Это снизит риск, что мы начнем редактировать execution-слои, не договорившись о пользовательском интерфейсе выбора.

## Короткий вывод

Идея пользователя логична, совместима с направлением репозитория и уже частично подготовлена существующей библиотекой.

Главный смысл изменений:

- перестать запускать production через creative exploration;
- начать запускать его через строгий library-backed конструктор.

Главная практическая сложность:

- библиотека уже неплохая, но еще не собрана в удобный user-facing каталог и не полностью покрывает весь желаемый vocabulary мира сцены.

Главная рекомендация:

- сначала утвердить constructor contract и catalog layer;
- потом переводить launch, `launch-card`, `build-plan` и validator в strict `library-only` режим.
