# Use Case UC-05: Handle Login Failure and Display Error Message (REFINED)

## Goal in Context
Handle a user login attempt that fails credential matching so the user is informed and unauthorized access is prevented.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
User (Author, Reviewer, Editor)

## Secondary Actors
Authentication Service, CMS Database

## Trigger
User submits the login form with credentials that do not match an existing account.

## Success End Condition
Login is denied, the user remains unauthenticated, and an appropriate error message is displayed.

## Failed End Condition
The system cannot evaluate the credentials (e.g., authentication/database failure) and informs the user to retry later.

## Preconditions
- User is on the CMS login page.
- CMS login service is available (unless failure extension occurs).

## Main Success Scenario (Invalid Credentials)
1. User navigates to the CMS login page.
2. CMS displays the login form requesting email/username and password.
3. User enters credentials.
4. User submits the login form.
5. CMS attempts to match the credentials against stored account records.
6. CMS determines the credentials do not match (unknown email/username or incorrect password).
7. CMS denies authentication and does not create a session.
8. CMS displays an error message indicating the login attempt failed.
9. CMS allows the user to retry login.

## Extensions
- **6a** Email/username is not registered  
  - **6a1** CMS displays “Account not found” and blocks login.

- **6b** Password is incorrect for a registered account  
  - **6b1** CMS displays “Invalid password” and blocks login.

- **5a** User submits empty required fields  
  - **5a1** CMS highlights missing inputs and prevents submission.

- **5b** Authentication service or database unavailable  
  - **5b1** CMS displays a system error and requests the user retry later.

## Related Information
- UC-03 covers the successful login path.
- UC-02 covers registration-time validation rules; UC-05 focuses on login mismatch outcomes.
