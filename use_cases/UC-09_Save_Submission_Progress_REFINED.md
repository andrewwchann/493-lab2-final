# Use Case UC-06: Save Submission Progress (REFINED)

## Goal in Context
Allow an author to save an in-progress paper submission as a draft so that it can be completed and submitted later.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Author

## Secondary Actors
CMS Database

## Trigger
Author selects **Save Draft** while completing the paper submission form.

## Success End Condition
The current submission information is saved as a draft and can be resumed later without entering the review process.

## Failed End Condition
The draft is not saved, and the author is informed of the failure (e.g., missing minimal draft data or system error).

## Preconditions
- Author is logged into CMS.
- Submission deadline has not passed.
- Author is on the submission form for a new paper or an existing draft.

## Main Success Scenario
1. Author navigates to the **Paper Submission** page and begins entering submission information.
2. CMS displays a **Save Draft** option at any time during form completion.
3. Author enters some submission data (e.g., title and co-authors) and may or may not upload a manuscript yet.
4. Author selects **Save Draft**.
5. CMS validates that the draft contains the minimum required information to save (e.g., at least a draft title/identifier).
6. CMS stores the draft submission record in the database with status **Draft**.
7. CMS confirms the draft was saved successfully.
8. Later, author returns to **My Submissions**, selects the draft, and resumes editing from the saved state.

## Extensions
- **5a** Minimum required draft information is missing  
  - **5a1** CMS displays an error message and does not save the draft.

- **6a** System cannot save draft due to database error  
  - **6a1** CMS displays an error and advises the author to retry later.

- **8a** Author attempts to resume a draft after deadline has passed  
  - **8a1** CMS allows viewing but blocks final submission (submission closure rules apply).

## Related Information
- Draft saving supports completing submission later without losing progress.
- A draft does not enter review until the author performs final submission (UC-06).
