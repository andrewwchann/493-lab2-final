# Spec vs Use Case Validation: UC-01 Register Account

**Date**: 2026-02-05  
**Spec**: `/home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-register-account/spec.md`  
**Use Case**: `/home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-01_Register_Account.md`

## Summary

- **Flow alignment**: **Mostly aligned** with UC-01 main flow and extensions; minor additions beyond UC-01 are present.
- **Functional requirements congruence**: **Partially congruent**; several requirements add detail not stated in UC-01 (though some are supported by acceptance tests).

## Flow Alignment (UC-01 Main Success Scenario)

| UC-01 Step | Use Case Statement | Spec Coverage | Status |
|------------|--------------------|---------------|--------|
| 1 | User requests to register on the CMS system. | Implied by User Story 1; not explicitly stated as a step. | Partial |
| 2 | System displays the registration form. | FR-001; User Story 1 scenario. | Pass |
| 3 | User fills out the registration form with required information. | Implied by “submits valid registration data”; required fields stated in FR-002. | Partial |
| 4 | User submits the registration form. | User Story 1 scenario. | Pass |
| 5 | System validates the provided email and password. | FR-003, FR-005; User Story 2 scenarios. | Pass |
| 6 | System stores the new user account information. | FR-008; User Story 1 scenario. | Pass |
| 7 | System redirects the user to the login page. | FR-009; User Story 1 scenario. | Pass |

## Flow Alignment (UC-01 Extensions)

| Extension | Use Case Statement | Spec Coverage | Status |
|----------|--------------------|---------------|--------|
| 5a | Email is invalid or already registered → system displays error and prompts correction. | FR-003/FR-004, User Story 2 scenarios; FR-010 (resubmit). | Pass |
| 5b | Password does not meet security requirements → system displays error and allows re-enter. | FR-005; User Story 2 scenario; FR-010 (resubmit). | Pass |

## Spec Additions Beyond UC-01 (Not Style/Grammar)

These items are present in `spec.md` but are **not explicitly stated** in UC-01. They go beyond style/grammar changes:

1. **Required fields fixed to name/email/password** (FR-002; Assumptions). UC-01 says required fields are unspecified.
2. **Field-level error messages must identify field and reason** (FR-003–FR-007). UC-01 only states “error message.”
3. **Multiple invalid fields handling** (FR-006) and **missing required fields** (FR-007). Not in UC-01 main flow or extensions.
4. **No account creation on any invalid submission** (FR-008 explicit; UC-01 only states account not created on failure in general).

Note: Some of these additions are supported by UC-01 acceptance tests, but they are still not part of the UC-01 prose.

## Functional Requirements Congruence

| FR ID | Requirement Summary | Congruent to UC-01? | Notes |
|-------|----------------------|---------------------|-------|
| FR-001 | Display registration form to guest users | Yes | Matches UC-01 Step 2 |
| FR-002 | Require name, email, password | **Partial** | UC-01 says required fields unspecified (open issue) |
| FR-003 | Validate email format; field-level error w/ reason | **Partial** | UC-01 says invalid email → error; no field-level requirement |
| FR-004 | Duplicate email → field-level error w/ reason | **Partial** | UC-01 says duplicate → error; no field-level requirement |
| FR-005 | Validate password per UC-01/AT-04; field-level error w/ reason | **Partial** | UC-01 says password security requirements; no field-level requirement |
| FR-006 | Surface errors for all invalid fields | **No** | Not stated in UC-01 flow or extensions |
| FR-007 | Reject missing required fields; field-level errors | **No** | Not stated in UC-01 flow or extensions |
| FR-008 | Create account only when all required fields valid | **Yes** | Consistent with success/failure end conditions |
| FR-009 | Redirect to login on success | Yes | Matches UC-01 Step 7 |
| FR-010 | Allow correction and resubmission | Yes | Matches UC-01 extension outcomes |

## Conclusion

- The **core flow** is preserved, with minor implicit phrasing differences (steps 1 and 3 are implied, not explicitly stated).
- The **spec introduces additional requirements** beyond UC-01 (required fields and error message granularity, multi-error handling, missing fields). These are not just style/grammar changes.
- If strict UC-only repetition is required, consider removing or clearly labeling those additions as coming from acceptance tests.

