# YouTube disclaimer and sources

Updated: 2026-06-09

## Short disclaimer for video description

The salary figures in this video are approximate monthly USD equivalents. Where an official salary is public, the amount is based on the published local salary and converted or rounded into USD. Where no official salary is published, the amount is a realistic public compensation / allowance estimate for production use, marked in the source table as `salary_confidence=estimated`.

Figures may exclude benefits, residence, security, travel, staff, pensions, private wealth, royal household budgets, and non-salary state expenses. Exchange rates, local salary laws, and political offices can change, so the values should be treated as approximate 2025-2026 estimates, not exact payroll records.

## Russian disclaimer for video description

Цифры в видео - это примерный месячный эквивалент в долларах США. Если официальная зарплата опубликована, сумма взята из локальной зарплаты и пересчитана/округлена в USD. Если официальная зарплата не раскрыта, использована реалистичная оценка публичного содержания, allowance или представительской компенсации; такие строки в таблице помечены как `salary_confidence=estimated`.

В суммы обычно не входят льготы, резиденция, охрана, перелеты, штат сотрудников, пенсии, личное состояние, бюджеты королевских дворов и другие государственные расходы, которые не являются личной зарплатой. Курсы валют, законы о зарплатах и политические должности меняются, поэтому значения нужно воспринимать как приблизительные оценки за 2025-2026 годы, а не как точные платежные ведомости.

## Main evidence files in this project

- `data/top100_leader_salaries_2025_2026.csv` - final production table used for the video.
- `data/fact_check_report.csv` - row-by-row fact-check status, source notes, and confidence.
- `data/portrait_credits.csv` - portrait sources and attribution.
- `data/source_notes.md` - methodology and QA summary.

## Core sources

Leader / office verification:

- CIA World Leaders: https://www.cia.gov/resources/world-leaders/
- Wikidata leader and portrait metadata: https://www.wikidata.org/
- Wikimedia Commons portrait metadata: https://commons.wikimedia.org/

The current head-of-state list was rechecked row-by-row on 2026-06-09. Most rows matched Wikidata `P35` head-of-state data; exceptions such as Iran, Myanmar, Iraq, Haiti, Switzerland, Bolivia, Dominican Republic, Mexico, and Honduras are documented in `data/fact_check_report.csv` with fresher CIA, AP, official government, or transition-specific sources.

Population ranking:

- Wikipedia country population table: https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population

Salary seed source:

- List of heads of state and government salaries: https://en.wikipedia.org/wiki/List_of_heads_of_state_and_government_salaries

## Additional salary correction sources

These sources were used for rows where the broad salary table was stale, misleading, or needed local-currency correction:

- India President salary law / emoluments: https://www.mha.gov.in/sites/default/files/2022-08/PresidentsActupto2018_09082018%5B1%5D_0.pdf
- Pakistan President salary amendment: https://www.pakistancode.gov.pk/pdffiles/administrator5aec1130757e2fbcae3401d26e103d9e.pdf
- Nigeria RMAFC remuneration package: https://rmafc.gov.ng/wp-content/uploads/2020/01/Remuneration-Package-for-Political-and-Judicial-Office-Holders-.pdf
- Bangladesh President salary law: https://laws.sayed.app/laws/act-487
- Mexico public pay reporting: https://mexiconewsdaily.com/politics/how-much-do-mexicos-elected-officials-really-earn/
- DR Congo salary budget report: https://kt.cd/2024/03/07/en-rdc-le-president-felix-tshisekedi-touche-un-salaire-annuel-de-129-600-usd/
- Egypt president salary law reporting: https://www.egypt-business.com/news/details/1420-egypt-president-salary-to-be-raised-to-egp42000/9080
- South Africa remuneration determinations: https://www.remcommission.gov.za/library/determinations
- Kenya SRC salary reference: https://www.src.go.ke/
- Argentina presidential salary reporting: https://www.lanacion.com.ar/politica/cuanto-cobra-de-sueldo-el-presidente-de-la-nacion-nid30122025/
- Ukraine presidential salary declaration reporting: https://modern.az/en/dunya/587191/zelensky-his-salary-and-income-disclosed/
- Chile remuneration source: https://cdn.hacienda.cl/
- Guatemala salary cut announcement: https://agn.gt/presidente-anuncia-que-a-partir-de-junio-entra-en-vigor-la-reduccion-del-25-de-su-salario/
- Czech Republic salary reporting: https://praguemorning.cz/czech-politicians-salaries-2026/
- Cuba weak secondary salary estimate retained only as production estimate: https://www.cinenetworth.com/miguel-diaz-canel-net-worth/
- Switzerland Federal Council compensation: https://www.admin.ch/fr/conseil-federal-revenu-voiture-voyages

## Recommended pinned comment

Data note: these are approximate monthly USD equivalents for video comparison. Some countries publish exact salaries; others only publish allowances, budget lines, or no official salary at all. Rows marked `estimated` in the project CSV are realistic production estimates, not confirmed official payroll. Full source table and fact-check notes are in the project files.
