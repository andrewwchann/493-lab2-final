# Data Model: Register Account

## Entities

### User Account (persistent)

**Purpose**: Represents a registered CMS user created via UC-01.

**Core fields**:
- **Account ID**: Unique identifier for the account.
- **Name**: User-provided display name.
- **Email**: User-provided email; must be unique.
- **Credential**: User-provided password credential (value stored per system security requirements).
- **Created At**: Account creation timestamp.

**Validation rules**:
- Name, email, and password are required. (UC-01, UC01-AT-06)
- Email must be in a valid format. (UC-01, UC01-AT-02)
- Email must be unique. (UC-01, UC01-AT-03)
- Password must meet the security requirements defined by UC-01 and UC01-AT-04. (UC-01, UC01-AT-04)

**Relationships**: None defined in UC-01.

### Registration Submission (transient)

**Purpose**: Represents the data entered during a registration attempt and any validation errors.

**Core fields**:
- **Name**
- **Email**
- **Password**
- **Field Errors**: One or more validation errors keyed by field.

**Persistence**: Not persisted as a stored record; exists only for validation and feedback.

## State Transitions

- **Submission Valid**: Registration submission passes validation, resulting in a new User Account and redirect to login. (UC01-AT-01)
- **Submission Invalid**: Registration submission fails validation, no account is created, field-level errors are returned to the user. (UC01-AT-02 through UC01-AT-06)
- **Corrected Resubmission**: Previously invalid submission is corrected and succeeds. (UC01-AT-07)
