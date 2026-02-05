# Use Case UC-06: Update Submitted Paper Manuscript (RE-REFINED)

## Goal in Context
Allow an author to replace a previously submitted manuscript with an updated version while ensuring the submission still satisfies all FR4 constraints.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Author

## Secondary Actors
CMS Database, File Upload Service

## Trigger
Author selects **Update Manuscript** for an existing submission.

## Success End Condition
The updated manuscript file replaces the prior version successfully, and the submission remains valid for review.

## Failed End Condition
Update is rejected due to missing required submission metadata, invalid file format, size violation (>7MB), or system failure.

## Preconditions
- Author is logged into CMS.
- Paper submission already exists (UC-06).
- Submission window is still open.

## Main Success Scenario
1. Author opens **My Submissions** and selects a submitted paper.
2. CMS displays submission metadata (authors, abstract, keywords, manuscript file).
3. Author selects **Replace Manuscript File**.
4. Author uploads a new manuscript file in an accepted format (PDF, Word, LaTeX).
5. CMS validates file type and ensures file size is ≤ **7MB**.
6. CMS confirms required metadata fields are still present (authors, abstract, keywords).
7. Author submits the update request.
8. CMS overwrites the previous manuscript file while preserving submission record.
9. CMS confirms the manuscript update was successful.

## Extensions
- **4a** Unsupported file format uploaded  
  - **4a1** CMS rejects upload and prompts for PDF/Word/LaTeX.

- **5a** Updated file exceeds 7MB  
  - **5a1** CMS blocks update and requests a smaller file.

- **6a** Submission metadata is incomplete  
  - **6a1** CMS blocks update until required fields are corrected.

- **8a** Upload/database failure during replacement  
  - **8a1** CMS displays system error and retains the previous manuscript version.

## Related Information
- Updated submissions must satisfy the same constraints as initial submission (UC-06 / FR4).
- Authors may save progress before finalizing update (UC-06).
