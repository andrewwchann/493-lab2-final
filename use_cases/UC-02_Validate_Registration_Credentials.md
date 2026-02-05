# Use Case UC-02: Validate Registration Credentials

## Goal in Context
Validate a user’s email address and password during registration so the user knows their registration input is acceptable.

## Scope
Conference Management System (CMS)

## Level
Subfunction

## Primary Actor
User (Guest / Public User)

## Secondary Actors
CMS Database

## Trigger
User submits the registration form containing an email and password.

## Success End Condition
The system confirms the email is valid and unique, and the password meets password security standards, allowing registration to proceed.

## Failed End Condition
The system determines the email and/or password is invalid, rejects the registration attempt, and informs the user that some fields are invalid.

## Preconditions
- User has accessed the registration form.
- User has entered an email address and password.

## Main Success Scenario
1. User submits the registration form with an email address and password.
2. System validates the email address format.
3. System checks that the email address is unique.
4. System validates that the password meets password security standards.
5. System confirms the credentials are valid and allows registration to continue.

## Extensions
- **2a** Email address format is invalid  
  - **2a1** System displays an error message indicating invalid fields.

- **3a** Email address is already registered  
  - **3a1** System displays an error message indicating invalid fields.

- **4a** Password does not meet password security standards  
  - **4a1** System displays an error message indicating invalid fields.

## Related Information
- **Priority**: High  
- **Frequency**: High (performed for every registration submission)  
- **Open Issues**: Exact password security standards are not specified.
