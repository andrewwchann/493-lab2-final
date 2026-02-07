# Quickstart: Use Case Specification Expansion

**Spec**: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/spec.md

## Purpose
This project implements the CMS strictly to satisfy UC-01 through UC-23 and the
associated acceptance tests. The web stack is vanilla HTML/CSS/JS and follows
MVC separation. Requirements not specified in use cases/tests (performance,
availability SLAs, accessibility, browser support) are out of scope.

## Project Layout
- Source: /home/ajchan/ECE493/lab/lab2/493-lab2-final/src/
- Acceptance tests: /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/
- Specs: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/

## Run Tests
If the project has an npm test harness configured, run:

```
npm test && npm run lint
```

If no automated test harness exists, use the acceptance test suites to validate
behavior manually against the implemented UI flows.

## Development Notes
- Do not introduce frameworks; use vanilla HTML/CSS/JS only.
- Keep MVC separation; avoid business logic in views.
- Trace every task to a specific use case and acceptance test.
- Pricing configuration is preloaded; no admin config UI is required.
