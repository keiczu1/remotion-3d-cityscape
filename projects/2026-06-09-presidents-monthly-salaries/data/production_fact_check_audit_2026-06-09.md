# Production fact-check audit

Updated: 2026-06-09

## Summary

- Rows checked: 100
- Current-office check: Wikidata P35/P6 sweep for all ISO3 rows, with external/official exceptions for transition/disputed/representative cases.
- Status counts: MATCHED_WIKIDATA_HEAD_OF_STATE=95, FIXED_COMMONWEALTH_REPRESENTATIVE_METHODOLOGY=3, CONFIRMED_CONTEXT_EXCEPTION=2
- Image status counts: IMAGE_UNIQUE=100

## Hard fixes applied

- Australia: Charles III -> Sam Mostyn, because the on-screen salary is governor-general equivalent.
- Canada: Charles III -> Louise Arbour, because the on-screen salary is governor-general equivalent and Arbour was installed on 2026-06-08.
- Papua New Guinea: Charles III -> Bob Dadae, because the on-screen salary is governor-general equivalent.

## Remaining caveat

Many salary numbers remain production estimates, not official payslips. They are marked through salary_confidence and salary_basis; the audit focused on preventing wrong person / wrong role / duplicate active portrait issues.

Full row-by-row audit: production_fact_check_audit_2026-06-09.csv
