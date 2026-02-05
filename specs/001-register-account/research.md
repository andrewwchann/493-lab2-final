# Research Notes: Register Account

## Decisions

### Decision 1: Storage is the CMS user account store
- **Rationale**: UC-01 explicitly states that user account information is stored in the CMS database and must be created on successful registration.
- **Alternatives considered**:
  - Temporary or file-based storage (rejected: not described in UC-01 and would not satisfy acceptance tests).
  - External identity provider (rejected: out of scope for UC-01 and violates use-case-only scope).

### Decision 2: Validation scope includes required fields, email format, email uniqueness, and password requirements referenced by UC-01/UC01-AT-04
- **Rationale**: UC-01 and UC01-AT-02 through UC01-AT-06 define invalid email, duplicate email, weak password, and missing fields as the validation surface. Clarifications specify required fields (name, email, password). Password requirements are defined by UC-01/UC01-AT-04 without adding extra rules.
- **Alternatives considered**:
  - Additional profile fields or advanced validation (rejected: not specified in UC-01 or acceptance tests).

### Decision 3: Error feedback is field-level per invalid field
- **Rationale**: UC01-AT-05 requires indicating both invalid fields. Clarification sets field-level error granularity.
- **Alternatives considered**:
  - Single generic error message (rejected: would not satisfy multi-field error feedback).

### Decision 4: Success behavior is redirect to login after account creation
- **Rationale**: UC-01 success end condition and UC01-AT-01 require redirect to login after successful registration.
- **Alternatives considered**:
  - Auto-login after registration (rejected: not specified and would add scope).

## Open Questions

None. All requirements are defined by UC-01, UC01-AT-01 through UC01-AT-07, and clarifications.
