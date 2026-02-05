# Quickstart: Register Account (UC-01)

## Purpose

Guide reviewers through the UC-01 registration flow and its validation alternatives using the authoritative acceptance tests.

## Prerequisites

- UC-01 use case: `/home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-01_Register_Account.md`
- UC-01 acceptance tests: `/home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-01_Acceptance_Test_Suite.md`

## Primary Flow (Happy Path)

1. Open the CMS registration page as a guest user.
2. Submit valid registration data as defined in UC01-AT-01.
3. Confirm the account is created and the user is redirected to the login page.
4. Verify the new credentials can be used to log in.

## Validation Alternatives

- Invalid email format: follow UC01-AT-02.
- Duplicate email: follow UC01-AT-03.
- Weak password: follow UC01-AT-04.
- Multiple invalid fields: follow UC01-AT-05.
- Missing required fields: follow UC01-AT-06.
- Correct and resubmit: follow UC01-AT-07.

## Expected Outcomes

- All validation failures return clear field-level errors and create no account.
- Successful registration redirects to login and allows subsequent login with the new account.
