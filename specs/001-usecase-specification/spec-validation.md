# Spec Validation: Use Case Parity (Re-examined)

**Date**: February 5, 2026  
**Spec**: `specs/001-usecase-specification/spec.md`  
**Use Cases**: `use_cases/`  
**Scope**: Verify that flows in `spec.md` restate the use cases without semantic changes beyond style/grammar, and that functional requirements are congruent with use cases.

## Summary

- **Verdict**: Not strict parity. Several items in `spec.md` introduce constraints not stated in the use cases.
- **Primary deviations**:
  - Login identifier restricted to **email only** (UC-05 states email/username).
  - Password complexity rules specified (UC-02 explicitly says standards are **not specified**).
  - Schedule visibility states **without login** (UC-20 says publicly accessible but does not specify login requirement).
  - Success criteria include **performance metrics/time limits** not present in use cases or acceptance tests.
  - Assumption about **required registration fields** (name/email/password) not specified in UC-01 (open issue).

## Flow Parity Check (Main Success Scenarios)

| Use Case | Status | Notes |
|---------|--------|-------|
| UC-01 | Aligned | Flow restated without semantic changes. |
| UC-02 | Aligned | Flow restated; password policy expansion occurs elsewhere in spec. |
| UC-03 | Aligned | Flow restated without semantic changes. |
| UC-04 | Aligned | Flow restated without semantic changes. |
| UC-05 | **Deviation** | Spec says login uses email only; UC-05 says email/username. |
| UC-06 | Aligned | Flow restated without semantic changes. |
| UC-07 | Aligned | Flow restated without semantic changes. |
| UC-08 | Aligned | Flow restated without semantic changes. |
| UC-09 | Aligned | Flow restated without semantic changes. |
| UC-10 | Aligned | Flow restated without semantic changes. |
| UC-11 | Aligned | Flow restated without semantic changes. |
| UC-12 | Aligned | Flow restated without semantic changes. |
| UC-13 | Aligned | Flow restated without semantic changes. |
| UC-14 | Aligned | Flow restated without semantic changes. |
| UC-15 | Aligned | Flow restated without semantic changes. |
| UC-16 | Aligned | Flow restated without semantic changes. |
| UC-17 | Aligned | Flow restated without semantic changes. |
| UC-18 | Aligned | Flow restated without semantic changes. |
| UC-19 | Aligned | Flow restated without semantic changes. |
| UC-20 | Aligned | Flow restated; “without login” appears elsewhere in spec. |
| UC-21 | Aligned | Flow restated without semantic changes. |
| UC-22 | Aligned | Flow restated without semantic changes. |
| UC-23 | Aligned | Flow restated without semantic changes. |

## Functional Requirements Congruence

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-001 to FR-002 | Aligned | Reflect UC-01/UC-02. |
| FR-003 | **Deviation** | Adds explicit password complexity not defined in UC-02. |
| FR-004 to FR-028 | Aligned | Derived from corresponding UC flows and extensions. |
| FR-029 | **Potential Deviation** | Adds “without login,” not explicitly stated in UC-20. |
| FR-030 to FR-032 | Aligned | Consistent with UC-21 to UC-23. |

## Success Criteria Congruence

- **SC-001 to SC-008**: **Deviation**. Include performance/time targets not specified in use cases or acceptance tests.

## Comparison to Previous `spec-validation.md`

The prior validation file claimed strict parity and listed changes (removal of password rules, email-only login restriction, and performance metrics) that are **not reflected in the current `spec.md`**. This re-examined validation supersedes that prior assessment.

## Conclusion

- If strict “use-case-only restatement” is required, the current `spec.md` is **not valid** due to the deviations above.
- If clarifications are acceptable, the spec is largely congruent with use case intent but should note that these are **explicitly added constraints**.
