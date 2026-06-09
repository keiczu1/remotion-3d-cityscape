# Source notes

Updated: 2026-06-09

## Production files

- `data/top100_leader_salaries_2025_2026.csv` - final working table for the video: top-100 countries by population, current president/head-of-state style leader where applicable, approximate monthly USD equivalent, source caveats, and portrait path.
- `data/fact_check_report.csv` - row-by-row QA report for all 100 entries with leader and salary verdicts.
- `data/portrait_credits.csv` - portrait source and attribution data for video credits.
- `public/ranking-corridor/2026-06-09-presidents-monthly-salaries/images/` - local portrait images used by the Remotion composition.
- `data/production_fact_check_audit_2026-06-09.csv` - production audit for current-office fit, representative exceptions, and active portrait uniqueness.

## Population basis

Population rank is based on the current country population table used during collection, with 2025-2026 style estimates where available.

Reference: https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population

## Leader basis

The video is framed around presidents / heads of state. The QA rule used here:

- republics: use the current president or de-facto president/head of state;
- Iran: use the Supreme Leader as head of state; the row was corrected from President Masoud Pezeshkian to Mojtaba Khamenei after the head-of-state recheck;
- monarchies: keep the monarch/head of state, but do not treat royal grants, civil lists, privy purses, or governor-general pay as a comparable president salary;
- Commonwealth realms with `salary_basis=governor_general_equivalent_estimate`: show the current governor-general / local representative, not the formal monarch, so the on-screen person matches the salary basis;
- collective or transitional cases: use the current public-facing executive/head-of-state equivalent and mark the office clearly.

Primary current-office cross-checks used CIA World Leaders plus official government pages and major wires where CIA was stale.

Reference: https://www.cia.gov/resources/world-leaders/

Full head-of-state recheck completed on 2026-06-09:

- 100 rows checked.
- 91 rows matched Wikidata truthy `P35` head-of-state data.
- 9 rows were documented exceptions where Wikidata labels were missing/stale, the office is collective/transitional, or fresher CIA/AP/official sources were more current.
- Iran was corrected from President Masoud Pezeshkian to Supreme Leader Mojtaba Khamenei because the requested rule is current head of state / representative leader.
- The row-by-row result is stored in `data/fact_check_report.csv` columns `head_of_state_recheck_status` and `head_of_state_recheck_source`.

Production representative recheck completed on 2026-06-09:

- Australia changed from Charles III to Sam Mostyn because the row uses governor-general compensation equivalent.
- Canada changed from Charles III to Louise Arbour because the row uses governor-general compensation equivalent and Arbour was installed on 2026-06-08.
- Papua New Guinea changed from Charles III to Bob Dadae because the row uses governor-general/head-of-state representative equivalent.
- Active portrait references were checked by hash: 100 active images, 0 duplicate active image hashes.

## Salary basis

Use `salary_usd_monthly_display` for on-screen numbers. It is a monthly equivalent, calculated from annual or local monthly pay estimates. It is not always an official payslip month.

Production rule after final fill: no row is left as `N/A`. When an official salary is not public, the row uses a realistic production estimate based on public allowance, representative head-of-state compensation, local pay reports, or comparable official compensation. Those rows are marked with `salary_confidence=estimated` and an estimate-style `salary_basis`.

The original seed source was Wikipedia's salary table, but the fact-check pass corrected clear currency and office errors and lowered confidence where the figure is only an aggregate estimate.

Reference: https://en.wikipedia.org/wiki/List_of_heads_of_state_and_government_salaries

Important corrections made:

- Ukraine: corrected to Volodymyr Zelenskyy.
- Argentina: fixed AR$ parsing error; AR$ is not USD. Current row uses a 2025 reported gross monthly salary estimate and approximate USD conversion.
- India, Pakistan, Nigeria, Bangladesh, Mexico, Egypt, South Africa, Kenya, Uganda, Angola, Chile, Guatemala, Czech Republic, Switzerland: corrected or re-based from local salary/allowance reports where the old USD number was stale or misleading.
- Myanmar, Iraq, Haiti, Bolivia, Dominican Republic, Switzerland: current leader/name/office corrected.
- Iran: current head-of-state rule corrected to Supreme Leader Mojtaba Khamenei.
- Japan, United Kingdom, Thailand, Spain, Canada, Morocco, Saudi Arabia, Malaysia, Australia, Cambodia, Jordan, Belgium, UAE, Sweden, Papua New Guinea: monarch/royal/governor-general money is marked as estimated/equivalent where used because it is not a comparable personal president salary.
- Cameroon, Syria, Cuba, Venezuela, Zambia, several conflict/transitional states: salary replaced with conservative production estimates when no reliable official salary source was found.

## QA summary

- CSV rows: 100
- Salary rows filled: 100
- `N/A` salary values remaining: 0
- Final portraits referenced by CSV: 100
- Final portrait files present: 100
- Active portrait hashes duplicated: 0
- Row-by-row fact-check report: `data/fact_check_report.csv`
- Production fact-check audit: `data/production_fact_check_audit_2026-06-09.csv`

Recommended on-screen wording:

> Approximate monthly equivalent in USD. Official salary where published; otherwise a realistic public compensation or allowance estimate. Benefits, residence, security, travel, wealth, and private assets are excluded.
